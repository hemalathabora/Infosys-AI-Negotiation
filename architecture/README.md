# Negotiation System — Architecture

## Purpose
This directory contains the architecture deliverables for the multi-agent negotiation system.

The architecture explains how the user interface, scenario configuration, orchestrator, AI agents, negotiation engine, and reporting layer fit together. It is a proposed logical architecture; individual components may be implemented by different team members.

## Deliverables

- `high-level-architecture.png` — end-to-end system overview.
- `component-architecture.png` — logical component breakdown and interactions.
- `negotiation-flow.png` — round-by-round negotiation process.
- `simulation-vs-practice.png` — comparison of the two operating modes.
- `architecture.md` — detailed architecture explanation.

## High-Level Flow

User → Scenario Selection → Agent Configuration → Orchestrator → AI Agents → Negotiation → Outcome Report

## Core Design Principle

The **Orchestrator** coordinates the negotiation. Agents contain their own goals, constraints, and personalities, while the negotiation engine handles proposals, counteroffers, state changes, and stopping conditions.

## Scope

This architecture focuses on system structure and interaction rather than implementation details. Technology choices can be finalized during development.
