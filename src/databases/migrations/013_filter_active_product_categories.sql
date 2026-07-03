-- Migration: f_get_product_categories should only return ACTIVE categories,
-- so inactive categories no longer appear on the public homepage.
BEGIN;

CREATE OR REPLACE FUNCTION apps.f_get_product_categories(p_page integer, p_page_size integer, p_base_url text)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_offset INTEGER;
    v_total INTEGER;
    v_result JSONB;
BEGIN
    -- offset
    v_offset := (p_page - 1) * p_page_size;

    -- total data (active only)
    SELECT COUNT(*) INTO v_total
    FROM apps.product_categories
    WHERE is_active = true;

    -- result
    SELECT jsonb_build_object(
        'data', COALESCE(
            jsonb_agg(row_to_json(t)), '[]'::jsonb
        ),
        'meta', jsonb_build_object(
            'page', p_page,
            'pageSize', p_page_size,
            'total', v_total
        )
    )
    INTO v_result
    FROM (
        SELECT
            id,
            name,
            CASE
                WHEN image IS NOT NULL AND image <> ''
                THEN p_base_url || image
                ELSE NULL
            END AS image,
            display_name,
            slug
        FROM apps.product_categories
        WHERE is_active = true
        ORDER BY id asc
        LIMIT p_page_size
        OFFSET v_offset
    ) t;

    RETURN v_result;
END;
$function$;

COMMIT;
