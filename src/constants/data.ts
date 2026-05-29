// Centralized data following Single Responsibility Principle
// All static data in one place for easy maintenance

import type {
  BootcampCardProps,
  SocialMediaLink,
  InsightArticle,
  NavigationLink,
  SiteSettings,
  ContactInfo,
  Testimonial,
} from '@/types';

export const navigationLinks: NavigationLink[] = [
  { label: 'About Us', href: '#about' },
  { label: 'BuildAReader', href: '/build-a-reader' },
  { label: 'Bootcamps', href: '#bootcamps' },
  { label: 'Blog', href: '/blog' },
];

export const footerNavigation: NavigationLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Bootcamps', href: '/#bootcamps' },
  { label: 'Initiatives', href: '/#initiatives' },
  { label: 'About Us', href: '/#about' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  {
    label: 'Request account deletion',
    href: '/request-account-deletion',
  },
];

export const socialMediaLinks: SocialMediaLink[] = [
  { platform: 'instagram', href: 'https://instagram.com/emprinte' },
  { platform: 'linkedin', href: 'https://linkedin.com/company/emprinte' },
  { platform: 'twitter', href: 'https://twitter.com/emprinte' },
];

export const contactInfo: ContactInfo = {
  email: 'hello@emprintereaders.com',
  phone: [
    { label: 'Adepeju', number: '081029348475' },
    { label: 'Abiola', number: '081029348475' },
  ],
};

export const stats = [
  { value: '50+', label: 'Active Members' },
  { value: '156+', label: 'Book Reviews' },
  { value: '2000+', label: 'Beautiful Stories' },
];

/** Defaults for admin site settings; stats labels match the homepage and stay fixed in the editor. */
export function getDefaultSiteSettings(): SiteSettings {
  return {
    navigationLinks: [...navigationLinks],
    footerNavigation: [...footerNavigation],
    socialMediaLinks: [...socialMediaLinks],
    contactInfo: { ...contactInfo, phone: [...contactInfo.phone] },
    stats: stats.map((s, i) => ({ id: String(i), ...s })),
  };
}

export const bookClubHero = {
  badge: 'Book Club',
  title: 'Reading That Changes the World.',
  description:
    "At Emprinte, we're on a mission to make Africa the world's most passionate reading community. From our engaging projects to our vibrant online space, we're helping readers grow, connect, and thrive. Ready to turn the page?",
  buttonText: 'Join Now',
};

export const insightArticles: InsightArticle[] = [
  {
    id: '1',
    date: 'Monday, March 2, 2026',
    title: 'Reading circles, real connection',
    description:
      'Why small groups change how we experience books—and each other.',
    body:
      'When readers gather in a circle, something shifts. The book stops being a solo exercise and becomes a shared language.\n\nAt Emprinte we have seen shy voices open up, bold opinions soften, and strangers become friends over a single chapter. You do not need a perfect venue or a flawless schedule—just consistency, kindness, and curiosity.\n\nIf you have been reading alone, consider inviting one other person this week. The story on the page is only half the journey; the other half is who you meet along the way.',
    image: 'https://picsum.photos/800/500?random=11',
  },
  {
    id: '2',
    date: 'Thursday, March 5, 2026',
    title: 'One book at a time: building habits that last',
    description:
      'Gentle structure beats grand resolutions when you want reading to stick.',
    body:
      'Most reading goals fail because they are built on guilt instead of rhythm. A short daily window—ten or fifteen minutes—often outlasts marathon sessions that burn you out.\n\nStack your habit: same chair, same mug, same light. Remove friction by keeping the next title visible. Celebrate small streaks; they compound.\n\nWe built Emprinte around this truth: Africa\'s reading culture grows one habit, one household, one book club at a time.',
    image: 'https://picsum.photos/800/500?random=12',
  },
  {
    id: '3',
    date: 'Tuesday, March 10, 2026',
    title: 'From excerpt to action',
    description:
      'Turning insight into something you actually do this week.',
    body:
      'A good article or talk should leave you with one clear next step—not a vague buzz of inspiration.\n\nAfter you read, write a single sentence: "This week I will ___." Tell someone. That accountability quietly doubles your odds of follow-through.\n\nOur blog exists for moments like that: short enough to finish, grounded enough to matter. Take one idea, test it for seven days, and notice what changes.',
    image: 'https://picsum.photos/800/500?random=13',
  },
  {
    id: '4',
    date: 'Friday, March 13, 2026',
    title: 'The shelf you actually finish',
    description:
      'A smaller stack can mean more books read—not fewer.',
    body:
      'Overflowing shelves look impressive on camera, but they often hide guilt, not progress. Try keeping only three titles in active rotation: one challenging, one comforting, one borrowed from a friend.\n\nWhen you finish one, you earn the next. That small rule restores the pleasure of choosing instead of drowning in options.\n\nReaders who try this for a month usually report calmer evenings and fewer unfinished chapters.',
    image: 'https://picsum.photos/800/500?random=14',
  },
  {
    id: '5',
    date: 'Wednesday, March 18, 2026',
    title: 'Notes in the margin',
    description:
      'Why scribbling while you read deepens memory—and conversation.',
    body:
      'Underlining is not vandalism when it helps you return to the spark you felt. A star in the margin, a question mark, a date—these are breadcrumbs for your future self.\n\nIn a club, those marks become invitations: "What did you think when the author said this?" The page stays the same; the room changes.\n\nIf you resist writing in books, use a pocket notebook. The habit matters more than the medium.',
    image: 'https://picsum.photos/800/500?random=15',
  },
  {
    id: '6',
    date: 'Monday, March 23, 2026',
    title: 'When the chapter is heavy',
    description:
      'Reading difficult themes with care—for yourself and the group.',
    body:
      'Some stories ask for slowness, not speed. It is fine to pause, breathe, or set a book aside until you are ready.\n\nIn community, name the weight lightly: "This part stayed with me." That honesty gives others permission to feel without performing toughness.\n\nEmprinte gatherings aim to be brave and gentle at once. The goal is understanding, not winning a debate.',
    image: 'https://picsum.photos/800/500?random=16',
  },
  {
    id: '7',
    date: 'Saturday, March 28, 2026',
    title: 'Audio counts',
    description:
      'Listeners are readers too—here is how to honour the habit.',
    body:
      'Whether you press play on a commute or at home, you are still following narrative, voice, and pacing. Do not let anyone shrink that.\n\nIf you miss paper, pair audio with a print copy for favourite passages. The double exposure can be wonderful for dense or lyrical work.\n\nOur community welcomes every format that keeps you inside stories.',
    image: 'https://picsum.photos/800/500?random=17',
  },
  {
    id: '8',
    date: 'Tuesday, April 1, 2026',
    title: 'Young readers at the table',
    description:
      'Including children without turning book club into homework.',
    body:
      'A separate picture-book corner, a ten-minute share, or a "bring one sentence" rule can fold kids in without pressure.\n\nWhen young people see adults enjoy reading—not endure assignments—they file it away as something adults actually choose.\n\nStart small: one family night, one story, one laugh together.',
    image: 'https://picsum.photos/800/500?random=18',
  },
  {
    id: '9',
    date: 'Friday, April 3, 2026',
    title: 'Rotating hosts, steady heart',
    description:
      'Sharing leadership so one person never carries the whole room.',
    body:
      'A simple rotation—snacks, timekeeper, discussion opener—distributes care and keeps gatherings from burning out a single organiser.\n\nTemplates help: opening check-in, three questions, closing gratitude. Predictability frees creativity inside the conversation.\n\nIf your group is new, try the rotation for six sessions and adjust what feels stiff.',
    image: 'https://picsum.photos/800/500?random=19',
  },
  {
    id: '10',
    date: 'Monday, April 6, 2026',
    title: 'Closing the loop',
    description:
      'How to end a season of reading without losing momentum.',
    body:
      'A final session can name what shifted: one insight per person, one title to recommend outward, one date for the next season.\n\nDocument lightly—a group chat name, a shared list—so return feels easy, not heroic.\n\nBreaks are not failure. Soil rests between plantings; readers do too.',
    image: 'https://picsum.photos/800/500?random=20',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    text: 'The biggest change for me has been consistency. To put it simply, Emprinte is a community of growth and self-development.',
    name: 'ADEOLA AINA',
    title: 'PROJECT MANAGER',
    rating: 5,
  },
  {
    id: '2',
    text: 'For me, Emprinte feels like a family away from home. The community has grown to represent a place where I can connect with like-minded, growth-inclined individuals.',
    name: 'IFESOLA OWOYEMI',
    title: 'HR MANAGER',
    rating: 5,
  },
  {
    id: '3',
    text: 'Emprinte is my growth family. The community has helped me to be more disciplined, and has provided a space that constantly challenges me to be better.',
    name: 'AYOBAMI AKOMOLAFE',
    title: 'FASHION DESIGNER',
    rating: 5,
  },
 
];

export const bootcampCards: BootcampCardProps[] = [
  {
    title: 'FINANCIAL TRACKER BOOTCAMP',
    cohort: 'Cohort II',
    participants: '8 20+',
    backgroundColor: 'bg-pink-200',
  },
  {
    title: 'SHOW YOUR WORK BOOTCAMP',
    cohort: 'Cohort I',
    participants: '8 25+',
    backgroundColor: 'bg-green-200',
  },
  {
    title: '5AM CLUB BOOTCAMP',
    cohort: 'Cohort III',
    participants: '8 34+',
    backgroundColor: 'bg-yellow-200',
  },
  {
    title: 'PRODUCTIVITY BOOTCAMP',
    cohort: 'Cohort IV',
    participants: '8 23+',
    backgroundColor: 'bg-green-600',
  },
  {
    title: 'EMPRINTE READING ROOM',
    cohort: 'Cohort XII',
    participants: '8 20+',
    backgroundColor: 'bg-purple-200',
  },
];
