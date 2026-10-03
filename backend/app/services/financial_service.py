def growth(current, previous):
    if previous == 0:
        return None
    return round(((current - previous) / previous) * 100, 2)


def net_profit_margin(net_profit, revenue):
    if revenue == 0:
        return None
    return round((net_profit / revenue) * 100, 2)


def debt_to_equity(debt, equity):
    if equity == 0:
        return None
    return round(debt / equity, 2)


def current_ratio(current_assets, current_liabilities):
    if current_liabilities == 0:
        return None
    return round(current_assets / current_liabilities, 2)


def free_cash_flow(cfo, capex):
    return round(cfo - capex, 2)