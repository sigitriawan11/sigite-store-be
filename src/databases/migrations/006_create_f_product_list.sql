



CREATE OR REPLACE FUNCTION apps.f_product_list(
    p_page integer,
    p_page_size integer,
    p_search text DEFAULT NULL,
    p_category_id integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
    v_offset integer;
    v_total integer;
    v_result jsonb;
BEGIN
    v_offset := (p_page - 1) * p_page_size;

    
    SELECT COUNT(*) INTO v_total
    FROM apps.products p
    LEFT JOIN apps.product_categories pc ON pc.id = p.brand_id
    WHERE (p_search IS NULL OR p_search = '' OR p.product_name ILIKE '%' || p_search || '%' OR p.code ILIKE '%' || p_search || '%')
      AND (p_category_id IS NULL OR p.brand_id = p_category_id);

    
    SELECT jsonb_build_object(
        'data', COALESCE(
            jsonb_agg(
                row_to_json(t)
            ), '[]'::jsonb
        ),
        'paginate', jsonb_build_object(
            'page', p_page,
            'pageSize', p_page_size,
            'total', v_total
        )
    )
    INTO v_result
    FROM (
        SELECT
            p.code AS "Code",
            p.product_name AS "Name",
            pc.display_name AS "Category",
            p.price AS "Price",
            CASE WHEN p.status = true THEN 'Active' ELSE 'Inactive' END AS "Status",
            p.raw_json AS "raw_json"
        FROM apps.products p
        LEFT JOIN apps.product_categories pc ON pc.id = p.brand_id
        WHERE (p_search IS NULL OR p_search = '' OR p.product_name ILIKE '%' || p_search || '%' OR p.code ILIKE '%' || p_search || '%')
          AND (p_category_id IS NULL OR p.brand_id = p_category_id)
        ORDER BY p.id ASC
        LIMIT p_page_size
        OFFSET v_offset
    ) t;

    RETURN v_result;
END;
$$;