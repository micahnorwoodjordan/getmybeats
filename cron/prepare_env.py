import os

output_fp = 'cron/env.cron'

with open(output_fp, 'w') as file:
    for variable, value in os.environ.items():
        file.write(f"export {variable}='{value}'\n")
