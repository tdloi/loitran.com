import { BlockMapType } from "react-notion";

export interface IPost {
  id: string;
  name: string;
  date: string;
  slug: string;
  description: string;
  published: boolean;
}
export interface IBlogPosts extends IPost {
  tags?: string[];
  year?: number;
  [key: string]: any;
}

export type PageProps = {
  title: string;
  description: string;
  content: BlockMapType;
};
