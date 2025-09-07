export interface AvatarData {
    name: string;
    url: string;
    requiredGames: number;
}

export const avatars: AvatarData[] = [
    { name: 'Astro #1', url: 'https://crediar.webcindario.com/img/a1.png', requiredGames: 0 },
    { name: 'Astro #2', url: 'https://crediar.webcindario.com/img/a2.png', requiredGames: 0 },
    { name: 'Astro #3', url: 'https://crediar.webcindario.com/img/a3.png', requiredGames: 0 },
    { name: 'Astro #4', url: 'https://crediar.webcindario.com/img/a4.png', requiredGames: 0 },
    { name: 'Guerrero', url: 'https://crediar.webcindario.com/img/v10.png', requiredGames: 10 },
    { name: 'Gladiador', url: 'https://crediar.webcindario.com/img/v11.png', requiredGames: 10 },
    { name: 'Vikingo', url: 'https://crediar.webcindario.com/img/v20.png', requiredGames: 20 },
    { name: 'Rey', url: 'https://crediar.webcindario.com/img/v100.png', requiredGames: 100 },
    { name: 'Emperador', url: 'https://crediar.webcindario.com/img/v500.png', requiredGames: 500 },
    { name: 'Leyenda', url: 'https://crediar.webcindario.com/img/v501.png', requiredGames: 500 },
];
