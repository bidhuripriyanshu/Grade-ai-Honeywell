import pandas as pd
import numpy as np
from faker import Faker
import random

fake = Faker()

rows = 50000

recipes = [
    "Recipe A",
    "Recipe B",
    "Recipe C",
    "Recipe D"
]

grades = [
    "Premium",
    "Standard",
    "Recycled",
    "Industrial"
]

operator_actions = [
    "Increase Steam",
    "Decrease Steam",
    "Increase Speed",
    "Decrease Speed",
    "Adjust Stock Flow",
    "No Action"
]

data = []

for i in range(rows):

    timestamp = fake.date_time_between(
        start_date='-180d',
        end_date='now'
    )

    recipe = random.choice(recipes)
    grade = random.choice(grades)

    machine_speed = round(np.random.normal(850,50),2)

    steam_pressure = round(np.random.normal(9.5,0.8),2)

    stock_flow = round(np.random.normal(105,8),2)

    moisture = round(
        np.random.normal(
            6 - (machine_speed-850)/300 + (9-steam_pressure)/4,
            0.4
        ),
        2
    )

    ash = round(np.random.normal(12,2),2)

    caliper = round(np.random.normal(0.18,0.015),3)

    basis_weight = round(
        np.random.normal(80 + (stock_flow-105)/10,2),
        2
    )

    alarm = "Normal"

    if steam_pressure < 8:
        alarm = "Low Steam"

    if steam_pressure > 11:
        alarm = "High Steam"

    if machine_speed > 940:
        alarm = "High Speed"

    if moisture > 7.2:
        alarm = "High Moisture"

    if moisture < 4.8:
        alarm = "Low Moisture"

    if alarm == "High Moisture":
        action = "Increase Steam"

    elif alarm == "Low Moisture":
        action = "Decrease Steam"

    elif alarm == "High Speed":
        action = "Decrease Speed"

    elif alarm == "Low Steam":
        action = "Increase Steam"

    elif alarm == "High Steam":
        action = "Decrease Steam"

    else:
        action = random.choice([
            "No Action",
            "Adjust Stock Flow"
        ])

    off_spec = "No"

    if (
        moisture > 7
        or moisture < 5
        or basis_weight < 76
        or basis_weight > 84
        or caliper < 0.16
        or caliper > 0.20
    ):
        off_spec = "Yes"

    data.append([
        timestamp,
        recipe,
        grade,
        machine_speed,
        steam_pressure,
        stock_flow,
        moisture,
        ash,
        caliper,
        basis_weight,
        action,
        alarm,
        off_spec
    ])

columns = [
    "Timestamp",
    "Recipe",
    "Grade",
    "Machine Speed",
    "Steam Pressure",
    "Stock Flow",
    "Moisture",
    "Ash",
    "Caliper",
    "Basis Weight",
    "Operator Action",
    "Alarm",
    "Off Spec"
]

df = pd.DataFrame(data, columns=columns)

df = df.sort_values("Timestamp")

df.to_csv("paper_factory_dataset.csv", index=False)

df.to_excel("paper_factory_dataset.xlsx", index=False)

print(df.head())

print("\nDataset Shape:", df.shape)

print("\nSaved Successfully!")