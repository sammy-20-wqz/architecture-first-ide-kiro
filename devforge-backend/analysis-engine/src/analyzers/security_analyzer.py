from typing import List, Dict, Any

class SecurityAnalyzer:
    def analyze(self, parsed_code: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze parsed code for security vulnerabilities."""
        issues = []
        
        # Mock logic: check for "dangerous" patterns in mapped code
        for pattern in parsed_code.get('patterns', []):
            if pattern == "hardcoded_credentials":
                issues.append({
                    "id": "SEC-001",
                    "severity": "CRITICAL",
                    "description": "Hardcoded credentials detected"
                })
        
        # Add some default mock issues if none found for demo
        if not issues:
             issues.append({
                "id": "SEC-002",
                "severity": "MEDIUM",
                "description": "Weak entry point configuration (Mock)"
            })
            
        return issues
