interface NotionEntry {
  id: string;
  type: string;
  parent_id: string;
  parent_table: string;
  created_by_id: string;
  created_by_table: string;
}

interface Block extends NotionEntry {
  type:
    | "bookmark"
    | "code"
    | "text"
    | "page"
    | "bullet_list"
    | "header"
    | "sub_header"
    | "sub_sub_header";
  format: {
    // bookmark
    bookmark_cover: string;
    bookmark_icon: string;
  };
  properties: {
    title: [[string]];
    description: [[string]]; // bookmark
    link: [[string]]; // bookmark
    language: [[string]]; // code
    [key: string]: [[string | [[string, { type: string; [key: string]: string }]]]];
  };
  content: [string]; // page
}

interface Collection extends NotionEntry {
  format: {
    collection_page_properties: [
      {
        visible: boolean;
        properties: string;
      }
    ];
  };
  schema: {
    [key: string]: {
      name: string;
      type: string;
    };
  };
}

export interface NotionResponse {
  cursor: any;
  result: {
    type: string;
    blockIds: [string];
  };
  recordMap: {
    block: {
      [key: string]: {
        value: Block;
      };
    };
    collection: {
      [key: string]: {
        value: Collection;
      };
    };
    collection_view: {
      [key: string]: {
        value: NotionEntry;
      };
    };
    notion_user: {
      [key: string]: {
        role: string;
        value: {
          id: string;
          email: string;
          family_name: string;
          given_name: string;
        };
      };
    };
  };
}
