/**
 * GraphQL Mutations
 */
import { gql } from '@apollo/client'

/**
 * Sign up a new user
 */
export const SIGNUP_MUTATION = gql`
  mutation Signup($email: String!, $name: String!, $password: String!) {
    signup(email: $email, name: $name, password: $password) {
      id
      email
      name
    }
  }
`

/**
 * Sign in an existing user
 */
export const SIGNIN_MUTATION = gql`
  mutation Signin($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      id
      email
      name
    }
  }
`

/**
 * Sign out current user
 */
export const SIGNOUT_MUTATION = gql`
  mutation Signout {
    signout {
      message
    }
  }
`

/**
 * Request password reset
 */
export const REQUEST_RESET_MUTATION = gql`
  mutation RequestReset($email: String!) {
    requestReset(email: $email) {
      message
    }
  }
`

/**
 * Reset password with token
 */
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword(
    $resetToken: String!
    $password: String!
    $confirmPassword: String!
  ) {
    resetPassword(
      resetToken: $resetToken
      password: $password
      confirmPassword: $confirmPassword
    ) {
      id
      email
      name
    }
  }
`

/**
 * Create a new item
 */
export const CREATE_ITEM_MUTATION = gql`
  mutation CreateItem(
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    createItem(
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id
    }
  }
`

/**
 * Update an existing item
 */
export const UPDATE_ITEM_MUTATION = gql`
  mutation UpdateItem(
    $id: ID!
    $title: String
    $description: String
    $price: Int
  ) {
    updateItem(id: $id, title: $title, description: $description, price: $price) {
      id
      title
      description
      price
    }
  }
`

/**
 * Delete an item
 */
export const DELETE_ITEM_MUTATION = gql`
  mutation DeleteItem($id: ID!) {
    deleteItem(id: $id) {
      id
    }
  }
`

/**
 * Add item to cart
 */
export const ADD_TO_CART_MUTATION = gql`
  mutation AddToCart($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`

/**
 * Remove item from cart
 */
export const REMOVE_FROM_CART_MUTATION = gql`
  mutation RemoveFromCart($id: ID!) {
    removeFromCart(id: $id) {
      id
    }
  }
`

/**
 * Create order from cart
 */
export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($token: String!) {
    createOrder(token: $token) {
      id
      charge
      total
      items {
        id
        title
      }
    }
  }
`

/**
 * Update user permissions
 */
export const UPDATE_PERMISSIONS_MUTATION = gql`
  mutation UpdatePermissions($permissions: [Permission!]!, $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      permissions
      name
      email
    }
  }
`
