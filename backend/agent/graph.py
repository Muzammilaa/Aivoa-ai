from typing import Any

from langgraph.graph import END, START, StateGraph

from agent.nodes import extract_fields_node
from agent.state import ComplaintState


workflow = StateGraph(ComplaintState)
workflow.add_node("extract_fields", extract_fields_node)
workflow.add_edge(START, "extract_fields")
workflow.add_edge("extract_fields", END)
complaint_graph = workflow.compile()


def run_complaint_pipeline(raw_text: str) -> dict[str, Any]:
    """Run the extraction-only graph for one raw complaint text."""
    initial_state: ComplaintState = {
        "raw_input": raw_text,
        "extracted_data": {},
        "parsing_errors": [],
        "ai_response": "",
        "metadata": {},
    }
    return dict(complaint_graph.invoke(initial_state))
