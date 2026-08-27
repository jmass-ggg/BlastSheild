INSERT INTO public.users (email, full_name, last_login, created_at)
SELECT
    'user' || number || '@example.test',
    'Demo User ' || number,
    CASE
        WHEN number <= 40 THEN NOW() - INTERVAL '3 years' - number * INTERVAL '1 day'
        ELSE NOW() - number * INTERVAL '3 days'
    END,
    NOW() - number * INTERVAL '10 days'
FROM generate_series(1, 100) AS number;

INSERT INTO public.orders (user_id, status, total_amount, created_at)
SELECT
    users.id,
    CASE WHEN order_number % 4 = 0 THEN 'refunded' ELSE 'completed' END,
    (25 + users.id * order_number)::NUMERIC(12, 2),
    users.created_at + order_number * INTERVAL '1 day'
FROM public.users
CROSS JOIN LATERAL generate_series(1, (users.id % 4 + 1)::INTEGER) AS order_number;

INSERT INTO public.payments (order_id, status, amount, created_at)
SELECT
    orders.id,
    CASE WHEN orders.status = 'refunded' THEN 'refunded' ELSE 'captured' END,
    orders.total_amount,
    orders.created_at + INTERVAL '1 hour'
FROM public.orders;

INSERT INTO public.subscriptions (user_id, status, monthly_price, created_at)
SELECT
    users.id,
    CASE WHEN users.id % 3 = 0 THEN 'cancelled' ELSE 'active' END,
    (19 + (users.id % 4) * 10)::NUMERIC(12, 2),
    users.created_at
FROM public.users
WHERE users.id % 2 = 0;

INSERT INTO public.sessions (user_id, token_hash, expires_at, created_at)
SELECT
    users.id,
    md5('blastshield-demo-session-' || users.id),
    NOW() + INTERVAL '7 days',
    NOW() - INTERVAL '1 hour'
FROM public.users
WHERE users.id % 5 <> 0;

