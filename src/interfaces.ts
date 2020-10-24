export interface IBlogEntry {
  id: string;
  name: string;
  date: string;
  slug: string;
  published: boolean;
  tags: Array<string>;
  year: number;
  [key: string]: any;
}
