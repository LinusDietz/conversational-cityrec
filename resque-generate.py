statements = list()
with open("resque.txt",'r') as resque:    
    for line in resque.readlines():
        if line.startswith("=>"):
            statement, shortname = line[3:].split('|')
            print(statement)
            statements.append((statement.strip(),shortname.strip()))
print(statements)

for s in statements:
    print(f"""    {{
      value: "{s[1]}",
      text: "{s[0]}"
    }},""")
