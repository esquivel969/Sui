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
    { name: 'Gladiador', url: 'https://placehold.co/128x128/31343C/FFFFFF/png?text=G', requiredGames: 10 },
    { name: 'Ninja', url: 'https://placehold.co/128x128/31343C/FFFFFF/png?text=N', requiredGames: 25 },
    { name: 'Mago', url: 'https://placehold.co/128x128/31343C/FFFFFF/png?text=M', requiredGames: 50 },
    { name: 'Rey', url: 'https://placehold.co/128x128/31343C/FFFFFF/png?text=R', requiredGames: 100 },
];
