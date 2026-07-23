export type QaUser = {
  email: string;
  password: string;
};

export type SearchData = {
  query: string;
};

export function buildSearchData(query: string): SearchData {
  return { query };
}

export function buildQaUser(email: string, password: string): QaUser {
  return { email, password };
}
