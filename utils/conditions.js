import { config } from '../config'

const ifExists = val => val !== undefined && val !== null

const isPage = page => ifExists(page) && ifExists(page.requirePath)
&& page.requirePath.match(/^pages\/.*$/)

const isPost = post => ifExists(post) && ifExists(post.requirePath)
&& post.requirePath.match(/^posts\/\d{4}\/\d{2}\/\d{2}\/.*\/index.md$/)


export default {
  ifExists: ifExists,
  isPage: isPage,
  isPost: isPost
}