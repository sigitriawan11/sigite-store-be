type Product = {
    id: number,
    name: string,
    display_name: string,
    slug: string,
    image: string
}

type Paginate = {
    page: number,
    pageSize: number,
    total: number
}

export interface RequestProductCategory {
    page: string | number,
    pageSize: string | number
}

export interface ResponseProductCategory {
    data: Array<Product>,
    meta: Paginate
}

export interface ResponseProductBySlug {
    product: {
        display_name: string,
        image: string,
        account_config: any
    }
    product_items: Array<{
        product_name: string,
        price: number,
        code: string,
        status: boolean,
        icon: string
    }>
}