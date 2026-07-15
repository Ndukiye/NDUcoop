class BusinessRuleViolation(Exception):
    """Base class for domain rule violations that should surface as 400s to the API layer."""


class InsufficientBalanceError(BusinessRuleViolation):
    pass


class WithdrawalNotEligibleError(BusinessRuleViolation):
    pass


class InvalidStateTransitionError(BusinessRuleViolation):
    pass


class InsufficientStockError(BusinessRuleViolation):
    pass
