import { gql } from "apollo-server-express";



export const typeDefs = gql
  (`
      scalar Upload ,
      type Query {
        users: [myyy],
        login(phone: String!, password: String!): operation!
        getAllCategory(input : inputGetCategory): [Category]
        getAllBrands(input : inputGetBrands): [Brand]

      }

      type Mutation {
        register(phone: String!, password: String!): operation!
        multimedia(image: Upload!): operation!
        category(input: inputCategory): operation!
        brand(input: inputBrand): operation!
      }

      input inputBrand {
        name: String,
        lable: String,
        category: ID
      }

      input inputGetBrands {
        page: Int,
        limit: Int,
        category: ID
      }
      
      type Brand {
        _id: ID,
        category: [Category],
        name: String,
        lable: String
      }

      input inputGetCategory {
        page: Int,
        limit: Int,
        mainCategory: Boolean,
        parentCategory: Boolean,
        catId: ID
      }

      type myyy {
        phone : String
      }

      input inputCategory {
        name: String,
        label: String,
        parent: ID,
        image: ID
      }

      type operation {
        status: Int,
        message: String,
        token: String
      }

      type Category {
        _id: ID,
        name: String,
        label: String,
        parent: parent,
      }

      type parent {
        _id: ID,
        name: String,
        label: String,
        parent: Category,
      }
     
  `)