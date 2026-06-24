/**
 * GraphQL Queries
 */
import { gql } from '@apollo/client'

/**
 * Get current user
 */
export const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    me {
      id
      email
      name
      permissions
      cart {
        id
        quantity
        item {
          id
          title
          description
          image
          price
        }
      }
    }
  }
`

/**
 * Get all items with pagination
 */
export const ALL_ITEMS_QUERY = gql`
  query AllItems($skip: Int = 0, $first: Int = 4) {
    items(skip: $skip, first: $first, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
      user {
        id
      }
    }
  }
`

/**
 * Get single item by ID
 */
export const SINGLE_ITEM_QUERY = gql`
  query SingleItem($id: ID!) {
    item(id: $id) {
      id
      title
      description
      price
      image
      largeImage
    }
  }
`

/**
 * Get items count for pagination
 */
export const PAGINATION_QUERY = gql`
  query PaginationQuery {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`

/**
 * Search items
 */
export const SEARCH_ITEMS_QUERY = gql`
  query SearchItems($searchTerm: String!) {
    items(
      where: {
        OR: [
          { title_contains: $searchTerm }
          { description_contains: $searchTerm }
        ]
      }
    ) {
      id
      title
      image
    }
  }
`

/**
 * Get all users (admin)
 */
export const ALL_USERS_QUERY = gql`
  query AllUsers {
    users {
      id
      name
      email
      permissions
    }
  }
`

/**
 * Get single order
 */
export const SINGLE_ORDER_QUERY = gql`
  query SingleOrder($id: ID!) {
    order(id: $id) {
      id
      charge
      total
      createdAt
      user {
        id
      }
      items {
        id
        title
        description
        price
        image
        quantity
      }
    }
  }
`

/**
 * Get all orders for current user
 */
export const USER_ORDERS_QUERY = gql`
  query UserOrders {
    orders {
      id
      total
      createdAt
      items {
        id
        title
        price
        description
        quantity
        image
      }
    }
  }
`
