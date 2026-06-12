with open("script.js", "r") as f:
    content = f.read()

content = content.replace("stonksChartInstance && window.stonksChartInstance.data", "window.stonksChartInstance && window.stonksChartInstance.data")

with open("script.js", "w") as f:
    f.write(content)
