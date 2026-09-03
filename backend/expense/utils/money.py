from decimal import Decimal, ROUND_HALF_UP

def round_money(amount: Decimal) -> Decimal:
    """Round a Decimal amount to 2 decimal places."""
    if not isinstance(amount, Decimal):
        amount = Decimal(str(amount))
    return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def calculate_equal_split(amount: Decimal, num_participants: int) -> list[Decimal]:
    """
    Splits amount equally among num_participants.
    Handles rounding so that sum(shares) == amount.
    Example: 100 / 3 -> [33.34, 33.33, 33.33]
    """
    if num_participants <= 0:
        raise ValueError("Number of participants must be greater than 0")
    
    amount = round_money(amount)
    
    total_cents = int(round(amount * 100))
    base_cents = total_cents // num_participants
    remainder_cents = total_cents % num_participants
    
    shares = []
    for i in range(num_participants):
        participant_cents = base_cents + (1 if i < remainder_cents else 0)
        shares.append(Decimal(participant_cents) / Decimal(100))
        
    return shares
