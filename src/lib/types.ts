export type Action = {
	title: string;
	url: string;
	svg: string;
	creator: string;
	description: string;
	stars: number;
	repo_url: string;
	stars_history: StarHistory[];
};

export type StarHistory = {
	at: string;
	count: number;
};
