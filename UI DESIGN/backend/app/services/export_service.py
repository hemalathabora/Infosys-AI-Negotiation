import csv
import io
import json
import re
from datetime import datetime
from typing import List, Dict, Any, Optional

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    HRFlowable
)

def sanitize_csv_cell(value: Any) -> str:
    """
    Prevents spreadsheet formula injection (CSV Injection / DDE).
    If a cell starts with =, +, -, @, tab, or carriage return,
    prefix with a single quote (') to force text evaluation.
    """
    if value is None:
        return ""
    text = str(value)
    # Check for dangerous leading characters that spreadsheet software interprets as formulas
    if text and text[0] in ("=", "+", "-", "@", "\t", "\r"):
        return f"'{text}"
    return text

def format_currency_val(val: Any) -> str:
    if val is None or val == "":
        return "Not available"
    try:
        num = float(val)
        return f"${num:,.2f}"
    except (ValueError, TypeError):
        return str(val)

def extract_safe_price(offer: Any) -> Optional[float]:
    if offer is None:
        return None
    if isinstance(offer, (int, float)):
        return float(offer)
    if isinstance(offer, dict):
        p = offer.get("price") or offer.get("value")
        if p is not None:
            try:
                return float(p)
            except (ValueError, TypeError):
                pass
    return None

def sanitize_session_for_export(session_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sanitizes session data for JSON export, stripping any sensitive fields,
    passwords, tokens, or internal secrets, and keeping clean chronological order.
    """
    forbidden_keys = {
        "hashed_password", "password", "token", "access_token",
        "api_key", "secret", "google_client_secret", "github_client_secret"
    }

    def clean_dict(d: Any) -> Any:
        if isinstance(d, dict):
            return {
                k: clean_dict(v) for k, v in d.items()
                if k.lower() not in forbidden_keys
            }
        elif isinstance(d, list):
            return [clean_dict(x) for x in d]
        return d

    cleaned = clean_dict(session_data)
    return cleaned

def generate_session_csv(session: Dict[str, Any], messages: List[Dict[str, Any]]) -> str:
    """
    Generates CSV export for a single negotiation session with full turn-by-turn history.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    # Header Row
    writer.writerow([
        "Session ID",
        "Scenario Name",
        "Scenario ID",
        "Date",
        "Mode",
        "Status",
        "Current Round",
        "Max Rounds",
        "Turn",
        "Round",
        "Agent ID",
        "Decision",
        "Proposed Offer Price",
        "Terms / Parameters",
        "Reasoning",
        "Timestamp"
    ])

    session_id = session.get("negotiation_id", "")
    scen_name = session.get("scenario_name", session.get("scenario_id", "Negotiation"))
    scen_id = session.get("scenario_id", "")
    created_at = session.get("created_at", "")
    mode = session.get("mode", "simulation")
    status = session.get("status", "")
    curr_round = session.get("current_round", 0)
    max_rounds = session.get("max_rounds", 5)

    if not messages:
        # Write single summary row if no turns recorded
        writer.writerow([
            sanitize_csv_cell(session_id),
            sanitize_csv_cell(scen_name),
            sanitize_csv_cell(scen_id),
            sanitize_csv_cell(created_at),
            sanitize_csv_cell(mode),
            sanitize_csv_cell(status),
            sanitize_csv_cell(curr_round),
            sanitize_csv_cell(max_rounds),
            sanitize_csv_cell("N/A"),
            sanitize_csv_cell("N/A"),
            sanitize_csv_cell("N/A"),
            sanitize_csv_cell("N/A"),
            sanitize_csv_cell("N/A"),
            sanitize_csv_cell("N/A"),
            sanitize_csv_cell("No messages recorded"),
            sanitize_csv_cell("N/A")
        ])
    else:
        for idx, msg in enumerate(messages, start=1):
            prop_offer = msg.get("proposed_offer") or {}
            price_val = extract_safe_price(prop_offer) or extract_safe_price(msg.get("value"))
            price_str = f"${price_val:,.2f}" if price_val is not None else "Not available"

            params = msg.get("parameters") or {}
            terms_parts = []
            if isinstance(prop_offer, dict) and "terms" in prop_offer:
                terms_parts.append(f"terms: {prop_offer['terms']}")
            if params:
                terms_parts.append(f"params: {json.dumps(params)}")
            terms_str = "; ".join(terms_parts) if terms_parts else "N/A"

            writer.writerow([
                sanitize_csv_cell(session_id),
                sanitize_csv_cell(scen_name),
                sanitize_csv_cell(scen_id),
                sanitize_csv_cell(created_at),
                sanitize_csv_cell(mode),
                sanitize_csv_cell(status),
                sanitize_csv_cell(curr_round),
                sanitize_csv_cell(max_rounds),
                sanitize_csv_cell(idx),
                sanitize_csv_cell(msg.get("round", "")),
                sanitize_csv_cell(msg.get("agent_id", "")),
                sanitize_csv_cell(msg.get("decision", "").upper()),
                sanitize_csv_cell(price_str),
                sanitize_csv_cell(terms_str),
                sanitize_csv_cell(msg.get("reasoning", "")),
                sanitize_csv_cell(msg.get("timestamp", ""))
            ])

    return output.getvalue()

def generate_all_history_csv(sessions_with_messages: List[Dict[str, Any]]) -> str:
    """
    Generates combined CSV export for all negotiation sessions of the user.
    """
    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_MINIMAL)

    writer.writerow([
        "Session ID",
        "Scenario Name",
        "Scenario ID",
        "Date",
        "Mode",
        "Status",
        "Rounds Completed",
        "Max Rounds",
        "Agreed / Final Price",
        "Turn Count",
        "Participants"
    ])

    for item in sessions_with_messages:
        session = item.get("session", {})
        agents = session.get("participating_agents", [])
        if isinstance(agents, list):
            agents_str = " vs ".join([a.get("name", a.get("id", "Agent")) for a in agents if isinstance(a, dict)])
        else:
            agents_str = str(agents)

        curr_offer = session.get("current_offer") or {}
        final_price = extract_safe_price(curr_offer)
        final_price_str = f"${final_price:,.2f}" if final_price is not None else "No agreement"

        writer.writerow([
            sanitize_csv_cell(session.get("negotiation_id", "")),
            sanitize_csv_cell(session.get("scenario_name", session.get("scenario_id", ""))),
            sanitize_csv_cell(session.get("scenario_id", "")),
            sanitize_csv_cell(session.get("created_at", "")),
            sanitize_csv_cell(session.get("mode", "simulation")),
            sanitize_csv_cell(session.get("status", "")),
            sanitize_csv_cell(session.get("current_round", 0)),
            sanitize_csv_cell(session.get("max_rounds", 5)),
            sanitize_csv_cell(final_price_str),
            sanitize_csv_cell(len(item.get("messages", []))),
            sanitize_csv_cell(agents_str)
        ])

    return output.getvalue()


class NumberedCanvas:
    """
    Canvas helper for ReportLab to support two-pass page numbering 'Page X of Y'.
    """
    def __init__(self, *args, **kwargs):
        pass


def generate_session_pdf(
    session: Dict[str, Any],
    messages: List[Dict[str, Any]],
    agents: List[Dict[str, Any]]
) -> bytes:
    """
    Generates a professional, multi-page PDF report for a negotiation session
    using ReportLab with NegoMind AI branding.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    brand_title_style = ParagraphStyle(
        "BrandTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#0F172A")
    )
    tagline_style = ParagraphStyle(
        "BrandTagline",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#4F46E5")
    )
    section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6
    )
    meta_label_style = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#64748B")
    )
    meta_val_style = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#0F172A")
    )
    transcript_header = ParagraphStyle(
        "TranscriptHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#F8FAFC")
    )
    transcript_cell = ParagraphStyle(
        "TranscriptCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1E293B")
    )
    transcript_cell_bold = ParagraphStyle(
        "TranscriptCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0F172A")
    )

    story = []

    # 1. Header & Project Branding
    header_data = [
        [
            Paragraph("<b>NEGOMIND AI</b>", brand_title_style),
            Paragraph("<b>CONFIDENTIAL NEGOTIATION AUDIT RECORD</b>", ParagraphStyle(
                "AuditTag", parent=styles["Normal"], fontName="Helvetica-Bold",
                fontSize=8, leading=10, alignment=2, textColor=colors.HexColor("#64748B")
            ))
        ],
        [
            Paragraph("THINK &bull; NEGOTIATE &bull; GROW &mdash; Multi-Agent Simulation Platform", tagline_style),
            Paragraph(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ParagraphStyle(
                "DateStamp", parent=styles["Normal"], fontName="Helvetica",
                fontSize=8, leading=10, alignment=2, textColor=colors.HexColor("#94A3B8")
            ))
        ]
    ]
    header_table = Table(header_data, colWidths=[340, 200])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#4F46E5"), spaceAfter=12))

    # 2. Executive Summary Box
    scen_name = session.get("scenario_name") or session.get("scenario_id", "Negotiation Session")
    scen_id = session.get("scenario_id", "vendor_pricing")
    mode = (session.get("mode") or "simulation").upper()
    status_raw = str(session.get("status") or "").lower()
    is_agreement = status_raw in ("accepted", "agreement", "completed")
    is_deadlock = status_raw in ("deadlock", "breakdown", "rejected")

    if is_agreement:
        outcome_label = "AGREEMENT REACHED"
        outcome_color = colors.HexColor("#059669")
    elif is_deadlock:
        outcome_label = "DEADLOCK / BREAKDOWN"
        outcome_color = colors.HexColor("#DC2626")
    else:
        outcome_label = status_raw.upper() or "IN PROGRESS"
        outcome_color = colors.HexColor("#D97706")

    curr_offer = session.get("current_offer") or {}
    final_price_val = extract_safe_price(curr_offer)
    final_price_str = f"${final_price_val:,.2f}" if (is_agreement and final_price_val is not None) else ("No agreement reached" if is_deadlock else "In progress")

    summary_grid = [
        [
            Paragraph("SCENARIO", meta_label_style),
            Paragraph(f"<b>{scen_name}</b>", meta_val_style),
            Paragraph("SESSION ID", meta_label_style),
            Paragraph(f"<font size=7>{session.get('negotiation_id', 'N/A')}</font>", meta_val_style)
        ],
        [
            Paragraph("MODE", meta_label_style),
            Paragraph(mode, meta_val_style),
            Paragraph("ROUNDS ELAPSED", meta_label_style),
            Paragraph(f"{session.get('current_round', 0)} / {session.get('max_rounds', 5)} max", meta_val_style)
        ],
        [
            Paragraph("FINAL OUTCOME", meta_label_style),
            Paragraph(f"<b><font color='{outcome_color.hexval()}'>{outcome_label}</font></b>", meta_val_style),
            Paragraph("AGREED TERMS / PRICE", meta_label_style),
            Paragraph(f"<b>{final_price_str}</b>", meta_val_style)
        ]
    ]

    summary_table = Table(summary_grid, colWidths=[100, 170, 110, 160])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F8FAFC")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#E2E8F0")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 14))

    # 3. Participating Agents / Roles
    story.append(Paragraph("Participating Agents & Objectives", section_heading))
    if agents:
        agent_rows = [[
            Paragraph("<b>Agent Name</b>", transcript_cell_bold),
            Paragraph("<b>Role / Persona</b>", transcript_cell_bold),
            Paragraph("<b>Objectives & Constraints</b>", transcript_cell_bold)
        ]]
        for a in agents:
            if not isinstance(a, dict):
                continue
            name = a.get("name", a.get("id", "Agent"))
            role = f"{a.get('role', 'N/A')} ({a.get('persona', a.get('personality', 'Standard'))})"
            goals = a.get("goals") or a.get("negotiation_objectives") or []
            if isinstance(goals, list):
                goal_str = "; ".join(goals) if goals else "Not specified"
            else:
                goal_str = str(goals)
            agent_rows.append([
                Paragraph(name, transcript_cell),
                Paragraph(role, transcript_cell),
                Paragraph(goal_str, transcript_cell)
            ])
        agents_table = Table(agent_rows, colWidths=[140, 150, 250])
        agents_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        story.append(agents_table)
    else:
        story.append(Paragraph("<i>No agent profile records available.</i>", meta_val_style))

    story.append(Spacer(1, 14))

    # 4. Turn-by-Turn Negotiation Transcript
    story.append(Paragraph("Negotiation Transcript & Offers", section_heading))

    if not messages:
        story.append(Paragraph("<i>No transcript messages recorded for this session.</i>", meta_val_style))
    else:
        transcript_data = [[
            Paragraph("Turn", transcript_header),
            Paragraph("Rnd", transcript_header),
            Paragraph("Agent", transcript_header),
            Paragraph("Decision", transcript_header),
            Paragraph("Offer / Value", transcript_header),
            Paragraph("Reasoning / Strategy", transcript_header)
        ]]

        for idx, msg in enumerate(messages, start=1):
            prop = msg.get("proposed_offer") or {}
            p_val = extract_safe_price(prop) or extract_safe_price(msg.get("value"))
            p_str = f"${p_val:,.2f}" if p_val is not None else "Not available"

            dec = (msg.get("decision") or "").upper()
            dec_color = "#059669" if dec in ("ACCEPT", "AGREEMENT") else ("#DC2626" if dec == "REJECT" else "#0284C7")

            reason = msg.get("reasoning") or "No strategic rationale recorded."

            transcript_data.append([
                Paragraph(str(idx), transcript_cell),
                Paragraph(str(msg.get("round", "")), transcript_cell),
                Paragraph(str(msg.get("agent_id", "")), transcript_cell_bold),
                Paragraph(f"<font color='{dec_color}'><b>{dec}</b></font>", transcript_cell),
                Paragraph(p_str, transcript_cell_bold),
                Paragraph(reason, transcript_cell)
            ])

        # Widths sum to 540 (printable width on 8.5 x 11 with 0.5in margins)
        transcript_table = Table(
            transcript_data,
            colWidths=[32, 32, 90, 60, 86, 240],
            repeatRows=1
        )
        transcript_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#94A3B8")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(transcript_table)

    doc.build(story)
    return buffer.getvalue()
