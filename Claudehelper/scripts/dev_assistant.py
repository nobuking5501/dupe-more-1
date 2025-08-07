#!/usr/bin/env python3
import os
import subprocess
import json
from pathlib import Path
from logger import ClaudeLogger

class DevAssistant:
    def __init__(self):
        self.logger = ClaudeLogger()
        self.project_root = Path(__file__).parent.parent.parent
        self.logger.log("DevAssistant initialized")
    
    def analyze_project_structure(self):
        structure = {}
        for root, dirs, files in os.walk(self.project_root):
            rel_path = os.path.relpath(root, self.project_root)
            if rel_path.startswith('.'):
                continue
            structure[rel_path] = {
                'dirs': dirs,
                'files': files,
                'file_count': len(files)
            }
        
        self.logger.log_task("Project structure analysis", "completed", 
                           f"Found {len(structure)} directories")
        return structure
    
    def find_config_files(self):
        config_patterns = ['*.json', '*.yaml', '*.yml', '*.toml', '*.ini', '*.cfg']
        config_files = []
        
        for pattern in config_patterns:
            config_files.extend(self.project_root.glob(pattern))
            config_files.extend(self.project_root.glob(f'**/{pattern}'))
        
        self.logger.log_task("Config file search", "completed", 
                           f"Found {len(config_files)} config files")
        return [str(f.relative_to(self.project_root)) for f in config_files]
    
    def run_command(self, command, cwd=None):
        if cwd is None:
            cwd = self.project_root
        
        try:
            result = subprocess.run(command, shell=True, cwd=cwd, 
                                  capture_output=True, text=True)
            self.logger.log_task(f"Command execution: {command}", 
                               "completed" if result.returncode == 0 else "failed",
                               f"Return code: {result.returncode}")
            return {
                'stdout': result.stdout,
                'stderr': result.stderr,
                'returncode': result.returncode
            }
        except Exception as e:
            self.logger.log_error(f"Command execution failed: {command}", str(e))
            return None
    
    def save_session_info(self, info):
        session_file = Path(__file__).parent.parent / "logs" / f"session_{self.logger.session_id}.json"
        with open(session_file, "w", encoding="utf-8") as f:
            json.dump(info, f, indent=2, ensure_ascii=False)
        self.logger.log_file_operation("save", str(session_file))

if __name__ == "__main__":
    assistant = DevAssistant()
    structure = assistant.analyze_project_structure()
    configs = assistant.find_config_files()
    
    session_info = {
        'timestamp': assistant.logger.session_id,
        'project_structure': structure,
        'config_files': configs
    }
    assistant.save_session_info(session_info)