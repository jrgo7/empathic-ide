import subprocess
import tempfile
import os
import shutil

class CRunner:
    def __init__(self, c_source: str = ""):
        self.c_source = c_source
        self.output = []
        self.success = False
        self.exe_path = None
        self.tmp_dir = None

    def load_c(self, c_source: str):
        self.c_source = c_source

    def compile(self):
        self.tmp_dir = tempfile.mkdtemp()
        c_path = os.path.join(self.tmp_dir, "code.c")
        exe_path = os.path.join(self.tmp_dir, "a.exe") 

        with open(c_path, "w") as f:
            f.write(self.c_source)

        result = subprocess.run(
            ["gcc", c_path, "-o", exe_path],
            capture_output=True,
            text=True
        )

        if result.returncode != 0:
            self.output.append(result.stderr)
            self.success = False
            return False

        self.exe_path = exe_path
        return True

    def run(self, args: list[str] = [], input_text: str = ""):
        self.output = []

        if not self.compile():
            return

        cmd = [self.exe_path] + args

        print(f"{input_text = }")

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            input=input_text
        )

        self.output.extend(result.stdout.splitlines())
        self.output.extend(result.stderr.splitlines())
        self.success = result.returncode == 0

    def cleanup(self):
        if self.tmp_dir and os.path.exists(self.tmp_dir):
            shutil.rmtree(self.tmp_dir)
            
    def execute_all(self, c_source: str, args: list[str] = [], input_text: str = ""):
        self.load_c(c_source)
        self.compile()
        self.run(args, input_text)
        self.cleanup()

if __name__ == "__main__":
    crunner = CRunner()
    c_code = r"""
    #include <stdio.h>
    
    int main(void){
        printf("Hello World\n");
        return 0;
    }
    """
    crunner.load_c(c_code)
    print(crunner.compile())
    crunner.run()
    print(crunner.output)
    crunner.cleanup()
