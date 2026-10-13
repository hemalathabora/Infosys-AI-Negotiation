import json
from sqlalchemy import Column, String, Integer, Text, DateTime, func
from app.database import Base

class CustomScenarioModel(Base):
    __tablename__ = "custom_scenarios"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, default="Business")
    description = Column(Text, nullable=False)
    participants_json = Column(Text, nullable=False)
    variables_json = Column(Text, nullable=True)
    objectives_json = Column(Text, nullable=True)
    constraints_json = Column(Text, nullable=True)
    agents_json = Column(Text, nullable=False)
    max_rounds = Column(Integer, nullable=False, default=10)
    mode = Column(String, nullable=False, default="simulation")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    @property
    def participants(self):
        return json.loads(self.participants_json) if self.participants_json else []

    @participants.setter
    def participants(self, value):
        self.participants_json = json.dumps(value)

    @property
    def variables(self):
        return json.loads(self.variables_json) if self.variables_json else []

    @variables.setter
    def variables(self, value):
        self.variables_json = json.dumps(value) if value is not None else "[]"

    @property
    def objectives(self):
        return json.loads(self.objectives_json) if self.objectives_json else {}

    @objectives.setter
    def objectives(self, value):
        self.objectives_json = json.dumps(value) if value is not None else "{}"

    @property
    def constraints(self):
        return json.loads(self.constraints_json) if self.constraints_json else {}

    @constraints.setter
    def constraints(self, value):
        self.constraints_json = json.dumps(value) if value is not None else "{}"

    @property
    def agents(self):
        return json.loads(self.agents_json) if self.agents_json else []

    @agents.setter
    def agents(self, value):
        self.agents_json = json.dumps(value)

    def to_dict(self):
        return {
            "id": self.id,
            "scenario_id": self.id,
            "scenario_name": self.name,
            "name": self.name,
            "title": self.name,
            "category": self.category,
            "description": self.description,
            "participants": self.participants,
            "variables": self.variables,
            "objectives": self.objectives,
            "constraints": self.constraints,
            "agents": self.agents,
            "max_rounds": self.max_rounds,
            "mode": self.mode,
            "is_custom": True,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def to_scenario_config(self):
        """
        Converts custom scenario into standard Scenario Configuration structure
        accepted by NegotiationOrchestrator and negotiation service.
        """
        return {
            "scenario_id": self.id,
            "scenario_name": self.name,
            "description": self.description,
            "category": self.category,
            "participants": self.participants,
            "variables": self.variables,
            "objectives": self.objectives,
            "constraints": self.constraints,
            "agents": self.agents,
            "max_rounds": self.max_rounds,
            "mode": self.mode,
            "is_custom": True,
            "zopa_enabled": True,
            "deadlock_detection_enabled": True
        }
