#!/usr/bin/env python3
import os
import datetime
import json
from pathlib import Path

class ClaudeLogger:
    def __init__(self, log_dir="logs"):
        self.log_dir = Path(__file__).parent.parent / log_dir
        self.log_dir.mkdir(exist_ok=True)
        self.session_id = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    def log(self, message, level="INFO", category="general"):
        timestamp = datetime.datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "session_id": self.session_id,
            "level": level,
            "category": category,
            "message": message
        }
        
        log_file = self.log_dir / f"{category}_{datetime.date.today()}.jsonl"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry, ensure_ascii=False) + "\n")
    
    def log_task(self, task_name, status="started", details=None):
        self.log(f"Task: {task_name} - {status}", "TASK", "tasks")
        if details:
            self.log(f"Details: {details}", "TASK", "tasks")
    
    def log_error(self, error_msg, context=None):
        self.log(f"Error: {error_msg}", "ERROR", "errors")
        if context:
            self.log(f"Context: {context}", "ERROR", "errors")
    
    def log_file_operation(self, operation, file_path, result="success"):
        self.log(f"{operation}: {file_path} - {result}", "FILE", "files")

if __name__ == "__main__":
    logger = ClaudeLogger()
    logger.log("Claude Helper logging system initialized")