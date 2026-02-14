class SecurityScorer:
    def calculate_score(self, vulnerabilities: list) -> int:
        """Calculate security score 0-100 based on vulnerabilities."""
        base_score = 100
        
        for vuln in vulnerabilities:
            severity = vuln.get("severity", "LOW")
            if severity == "CRITICAL":
                base_score -= 25
            elif severity == "HIGH":
                base_score -= 15
            elif severity == "MEDIUM":
                base_score -= 5
            elif severity == "LOW":
                base_score -= 1
                
        return max(0, base_score)
