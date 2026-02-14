from setuptools import setup, find_packages

setup(
    name="devforge-analysis-engine",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "networkx",
        "tree-sitter",
        "pydantic"
    ]
)
