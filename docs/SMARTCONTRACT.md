# Smart Contract Documentation

## StellarInsure contract

State-changing operations emit Soroban events for indexers and off-chain consumers.

### Events

#### `("policy", "created")`
- `policy_id`
- `policyholder`
- `policy_type`
- `coverage_amount`
- `premium`
- `start_time`
- `end_time`
- `trigger_condition`

#### `("policy", "premium")`
- `policy_id`
- `policyholder`
- `amount`

#### `("claim", "submit")`
- `policy_id`
- `policyholder`
- `claim_amount`
- `proof`
- `timestamp`

#### `("claim", "process")`
- `policy_id`
- `policyholder`
- `claim_amount`
- `approved`
- `status`

#### `("policy", "cancel")`
- `policy_id`
- `policyholder`

## RiskPool contract

The risk pool contract manages liquidity-provider balances and yield distribution.

### Core functions
- `add_liquidity(provider, amount)`
- `withdraw_liquidity(provider, amount)`
- `distribute_yield(amount)`
- `claim_yield(provider)`
- `get_provider_position(provider)`
- `get_pool_balance()`
- `get_pool_stats()`

### Pool events
- `("pool", "deposit")`
- `("pool", "withdraw")`
- `("pool", "yield")`
- `("pool", "claim")`
