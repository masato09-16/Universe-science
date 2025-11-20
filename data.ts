export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'documentation' | 'paper';
}

export interface Node {
  id: string;
  title: string;
  description: string;
  tier: 1 | 2 | 3;
  resources: Resource[];
  color?: string;
}

export interface Link {
  source: string;
  target: string;
}

export const nodes: Node[] = [
  // Tier 1: Major categories
  {
    id: 'ml',
    title: 'Machine Learning',
    description: 'The field of study that gives computers the ability to learn without being explicitly programmed.',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [
      {
        title: 'Introduction to Machine Learning',
        url: 'https://example.com/ml-intro',
        type: 'article',
      },
      {
        title: 'ML Course by Andrew Ng',
        url: 'https://example.com/ml-course',
        type: 'course',
      },
    ],
  },
  {
    id: 'python',
    title: 'Python',
    description: 'A high-level programming language widely used in data science and machine learning.',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [
      {
        title: 'Python Documentation',
        url: 'https://docs.python.org',
        type: 'documentation',
      },
    ],
  },
  {
    id: 'stats',
    title: 'Statistics',
    description: 'The study of the collection, analysis, interpretation, and presentation of data.',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [
      {
        title: 'Statistics Fundamentals',
        url: 'https://example.com/stats',
        type: 'course',
      },
    ],
  },

  // Tier 2: Sub-categories
  {
    id: 'supervised',
    title: 'Supervised Learning',
    description: 'A type of machine learning where the model is trained on labeled data.',
    tier: 2,
    color: '#ff00ff', // Magenta
    resources: [
      {
        title: 'Supervised Learning Explained',
        url: 'https://example.com/supervised',
        type: 'article',
      },
      {
        title: 'Supervised Learning Tutorial',
        url: 'https://example.com/supervised-tutorial',
        type: 'video',
      },
    ],
  },
  {
    id: 'unsupervised',
    title: 'Unsupervised Learning',
    description: 'A type of machine learning that finds patterns in data without labeled examples.',
    tier: 2,
    color: '#ff00ff', // Magenta
    resources: [
      {
        title: 'Unsupervised Learning Guide',
        url: 'https://example.com/unsupervised',
        type: 'article',
      },
    ],
  },
  {
    id: 'pandas',
    title: 'Pandas',
    description: 'A powerful data manipulation and analysis library for Python.',
    tier: 2,
    color: '#ff00ff', // Magenta
    resources: [
      {
        title: 'Pandas Documentation',
        url: 'https://pandas.pydata.org/docs/',
        type: 'documentation',
      },
    ],
  },
  {
    id: 'numpy',
    title: 'NumPy',
    description: 'A fundamental package for scientific computing with Python.',
    tier: 2,
    color: '#ff00ff', // Magenta
    resources: [
      {
        title: 'NumPy Documentation',
        url: 'https://numpy.org/doc/',
        type: 'documentation',
      },
    ],
  },

  // Tier 3: Specific tools/concepts
  {
    id: 'lightgbm',
    title: 'LightGBM',
    description: 'A gradient boosting framework that uses tree based learning algorithms.',
    tier: 3,
    color: '#ffff00', // Yellow
    resources: [
      {
        title: 'LightGBM Documentation',
        url: 'https://lightgbm.readthedocs.io/',
        type: 'documentation',
      },
      {
        title: 'LightGBM Tutorial',
        url: 'https://example.com/lightgbm-tutorial',
        type: 'article',
      },
    ],
  },
  {
    id: 'xgboost',
    title: 'XGBoost',
    description: 'An optimized distributed gradient boosting library designed to be highly efficient.',
    tier: 3,
    color: '#ffff00', // Yellow
    resources: [
      {
        title: 'XGBoost Documentation',
        url: 'https://xgboost.readthedocs.io/',
        type: 'documentation',
      },
    ],
  },
  {
    id: 'optuna',
    title: 'Optuna',
    description: 'An automatic hyperparameter optimization software framework.',
    tier: 3,
    color: '#ffff00', // Yellow
    resources: [
      {
        title: 'Optuna Documentation',
        url: 'https://optuna.org/',
        type: 'documentation',
      },
      {
        title: 'Hyperparameter Tuning with Optuna',
        url: 'https://example.com/optuna-tutorial',
        type: 'article',
      },
    ],
  },
  {
    id: 'sklearn',
    title: 'Scikit-learn',
    description: 'A machine learning library for Python built on NumPy, SciPy, and matplotlib.',
    tier: 3,
    color: '#ffff00', // Yellow
    resources: [
      {
        title: 'Scikit-learn Documentation',
        url: 'https://scikit-learn.org/stable/',
        type: 'documentation',
      },
    ],
  },
];

export const links: Link[] = [
  // ML connections
  { source: 'ml', target: 'supervised' },
  { source: 'ml', target: 'unsupervised' },
  { source: 'supervised', target: 'lightgbm' },
  { source: 'supervised', target: 'xgboost' },
  { source: 'supervised', target: 'sklearn' },
  { source: 'ml', target: 'optuna' },
  
  // Python connections
  { source: 'python', target: 'pandas' },
  { source: 'python', target: 'numpy' },
  { source: 'python', target: 'sklearn' },
  { source: 'python', target: 'lightgbm' },
  { source: 'python', target: 'xgboost' },
  { source: 'python', target: 'optuna' },
  
  // Cross connections
  { source: 'stats', target: 'ml' },
  { source: 'pandas', target: 'sklearn' },
  { source: 'numpy', target: 'sklearn' },
];

