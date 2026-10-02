def growth(current, previous):

    if previous == 0:
        return None

    return ((current - previous) / previous) * 100


def net_profit_margin(net_profit, revenue):

    if revenue == 0:
        return None

    return (net_profit / revenue) * 100


def debt_to_equity(debt, equity):

    if equity == 0:
        return None

    return debt / equity


def current_ratio(current_assets, current_liabilities):

    if current_liabilities == 0:
        return None

    return current_assets / current_liabilities


def free_cash_flow(cfo, capex):

    return cfo - capex