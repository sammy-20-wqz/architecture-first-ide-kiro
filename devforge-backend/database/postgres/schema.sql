CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id UUID PRIMARY KEY,
    owner_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analysis_results (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    score_security INT CHECK (score_security BETWEEN 0 AND 100),
    score_architecture INT CHECK (score_architecture BETWEEN 0 AND 100),
    raw_output JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
