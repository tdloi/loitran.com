export interface IPost {
  id: string;
  name: string;
  date: string;
  slug: string;
  description: string;
  published: boolean;
}
export interface IBlogEntry extends IPost {
  tags?: Array<string>;
  year?: number;
  [key: string]: any;
}
