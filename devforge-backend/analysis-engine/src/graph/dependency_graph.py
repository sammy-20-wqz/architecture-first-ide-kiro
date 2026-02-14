import networkx as nx
from typing import Dict, List

class DependencyGraph:
    def __init__(self):
        self.graph = nx.DiGraph()
    
    def add_component(self, component_id: str, metadata: Dict):
        self.graph.add_node(component_id, **metadata)
    
    def add_dependency(self, source: str, target: str, type: str):
        self.graph.add_edge(source, target, type=type)
    
    def get_cycles(self) -> List[List[str]]:
        """Detect circular dependencies."""
        try:
            return list(nx.simple_cycles(self.graph))
        except:
            return []
            
    def get_centrality(self) -> Dict[str, float]:
        """Calculate degree centrality for components."""
        return nx.degree_centrality(self.graph)
