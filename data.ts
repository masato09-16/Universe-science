export interface ResourceRating {
  userId: string; // ユーザーID（GoogleアカウントのID）
  userName?: string; // ユーザー名
  rating: number; // 評価（1-5）
  ratedAt: string; // 評価日時
}

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'course' | 'documentation' | 'paper';
  summary?: string; // 記事の要約（自動生成）
  rating?: number; // 評価（1-5）- 後方互換性のため残す
  ratings?: ResourceRating[]; // ユーザーごとの評価リスト
  userAdded?: boolean; // ユーザーが追加したリソースかどうか
  addedBy?: string; // 追加したユーザー名（オプション）
  addedAt?: string; // 追加日時
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
  // ============================================
  // Tier 1: 6つの主要なGalaxy（大分類）
  // ============================================
  {
    id: 'math-stats',
    title: '数学・統計学の基礎',
    description: 'データサイエンスの基盤となる数学と統計学の基礎知識',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [],
  },
  {
    id: 'engineering',
    title: 'コンピュータサイエンス・エンジニアリング',
    description: 'データを扱うための道具と環境',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [],
  },
  {
    id: 'data-prep',
    title: 'データ前処理・EDA',
    description: '分析の8割を占める重要なプロセス',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [],
  },
  {
    id: 'ml',
    title: '機械学習：モデリング',
    description: '最も「星（手法）」が多いエリア',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [],
  },
  {
    id: 'deep-learning',
    title: 'ディープラーニング・AI',
    description: '近年急拡大している、輝きの強い星団',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [],
  },
  {
    id: 'business-mlops',
    title: 'ビジネス応用・MLOps',
    description: 'モデルを実社会で価値に変えるための領域',
    tier: 1,
    color: '#00ffff', // Cyan
    resources: [],
  },

  // ============================================
  // Tier 2: 中分類（星系）
  // ============================================

  // 数学・統計学の基礎 - 中分類
  {
    id: 'descriptive-stats',
    title: '記述統計学',
    description: 'データの特徴を要約・記述する統計学',
    tier: 2,
    color: '#ff00ff', // Magenta
    resources: [],
  },
  {
    id: 'probability',
    title: '確率・確率分布',
    description: '確率変数と確率分布の基礎',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'inferential-stats',
    title: '推測統計学',
    description: '標本から母集団を推測する統計学',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'linear-algebra',
    title: '線形代数・微分積分',
    description: '機械学習の数学的基盤',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },

  // コンピュータサイエンス・エンジニアリング - 中分類
  {
    id: 'programming',
    title: 'プログラミング基礎',
    description: 'Python/Rの基本構文と環境構築',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'data-libs',
    title: 'データ操作ライブラリ',
    description: 'Numpy, Pandas, Polarsなどのデータ処理ライブラリ',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'database',
    title: 'データベース・SQL',
    description: 'RDBとNoSQLデータベースの基礎',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'devops',
    title: 'Linux・シェル・Git',
    description: '開発環境とバージョン管理',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },

  // データ前処理・EDA - 中分類
  {
    id: 'data-collection',
    title: 'データ収集',
    description: 'Webスクレイピング、API利用',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'preprocessing',
    title: 'データ前処理',
    description: '欠損値処理、外れ値検出、エンコーディング',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'eda',
    title: '探索的データ分析',
    description: '相関分析、可視化によるデータ探索',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },

  // 機械学習：モデリング - 中分類
  {
    id: 'supervised-regression',
    title: '教師あり学習（回帰）',
    description: '連続値を予測する回帰モデル',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'supervised-classification',
    title: '教師あり学習（分類）',
    description: 'カテゴリを予測する分類モデル',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'ensemble',
    title: 'アンサンブル学習',
    description: '複数のモデルを組み合わせる手法',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'unsupervised',
    title: '教師なし学習',
    description: 'ラベルなしデータからパターンを発見',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'time-series',
    title: '時系列解析',
    description: '時系列データの分析と予測',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'model-eval',
    title: 'モデル評価・最適化',
    description: 'モデルの評価指標とハイパーパラメータチューニング',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },

  // ディープラーニング・AI - 中分類
  {
    id: 'nn-basics',
    title: 'ニューラルネットワーク基礎',
    description: 'パーセプトロン、活性化関数、誤差逆伝播法',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'computer-vision',
    title: '画像認識',
    description: 'CNNと画像認識モデル',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'nlp',
    title: '自然言語処理',
    description: 'テキストデータの処理と理解',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'generative-ai',
    title: '生成AI',
    description: 'GANs、Diffusion Modelsなどの生成モデル',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },

  // ビジネス応用・MLOps - 中分類
  {
    id: 'mlops',
    title: 'MLOps',
    description: '機械学習モデルの運用と管理',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'business',
    title: 'ビジネス実装',
    description: '課題定義、KPI設計、A/Bテスト、因果推論',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },
  {
    id: 'ethics',
    title: '倫理・法務',
    description: 'AI倫理、バイアス、個人情報保護',
    tier: 2,
    color: '#ff00ff',
    resources: [],
  },

  // ============================================
  // Tier 3: 小分類（惑星・恒星）
  // ============================================

  // 記述統計学 - 小分類
  {
    id: 'central-tendency',
    title: '代表値',
    description: '平均、中央値、最頻値',
    tier: 3,
    color: '#ffff00', // Yellow
    resources: [],
  },
  {
    id: 'dispersion',
    title: '散布度',
    description: '分散、標準偏差、四分位範囲',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'data-viz-basic',
    title: 'データの可視化',
    description: 'ヒストグラム、箱ひげ図',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 確率・確率分布 - 小分類
  {
    id: 'random-variable',
    title: '確率変数と確率密度関数',
    description: '確率変数の基礎概念',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'distributions',
    title: '主要な分布',
    description: '正規分布、二項分布、ポアソン分布、t分布、カイ二乗分布',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'bayesian-stats',
    title: 'ベイズ統計学',
    description: 'ベイズの定理、事前・事後確率',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 推測統計学 - 小分類
  {
    id: 'estimation',
    title: '点推定と区間推定',
    description: '母集団パラメータの推定',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'hypothesis-testing',
    title: '仮説検定',
    description: 't検定、F検定、カイ二乗検定',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'p-value',
    title: 'p値と有意水準',
    description: '統計的有意性の判定',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'power-analysis',
    title: '検出力とサンプルサイズ',
    description: '統計的検定の設計',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 線形代数・微分積分 - 小分類
  {
    id: 'matrix-vector',
    title: '行列・ベクトル演算',
    description: '固有値・固有ベクトル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'partial-derivative',
    title: '偏微分',
    description: '勾配降下法の基礎',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'matrix-decomposition',
    title: '行列分解',
    description: 'SVD, PCAの基礎',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // プログラミング基礎 - 小分類
  {
    id: 'python-basics',
    title: 'Python基礎',
    description: '基本構文・データ型、制御構文・関数・クラス',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'r-basics',
    title: 'R基礎',
    description: 'R言語の基本構文とデータ操作',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'env-setup',
    title: '環境構築',
    description: 'Anaconda, venv, Docker',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // データ操作ライブラリ - 小分類
  {
    id: 'numpy',
    title: 'NumPy',
    description: '数値計算ライブラリ',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'pandas',
    title: 'Pandas',
    description: 'データフレーム操作・結合・集約',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'polars',
    title: 'Polars',
    description: '高速データ処理ライブラリ',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // データベース・SQL - 小分類
  {
    id: 'rdb',
    title: 'RDB基礎',
    description: '正規化、リレーショナルデータベース',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'sql',
    title: 'SQL',
    description: 'SELECT, JOIN, GROUP BY, Window関数',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'nosql',
    title: 'NoSQL',
    description: 'MongoDBなどのNoSQLデータベース',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // Linux・シェル・Git - 小分類
  {
    id: 'linux-shell',
    title: 'Linux・シェル',
    description: 'コマンドライン操作',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'git',
    title: 'Git/GitHub',
    description: 'バージョン管理',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // データ収集 - 小分類
  {
    id: 'web-scraping',
    title: 'Webスクレイピング',
    description: 'Webサイトからのデータ収集',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'api',
    title: 'API利用',
    description: 'REST API、GraphQLなどのAPI利用',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // データ前処理 - 小分類
  {
    id: 'missing-values',
    title: '欠損値処理',
    description: '削除・補完',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'outliers',
    title: '外れ値の検出と処理',
    description: '異常値の検出と対処',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'encoding',
    title: 'カテゴリ変数のエンコーディング',
    description: 'One-hot, Label, Target Encoding',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'scaling',
    title: '特徴量スケーリング',
    description: '正規化・標準化',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 探索的データ分析 - 小分類
  {
    id: 'correlation',
    title: '相関分析',
    description: '変数間の関係性の分析',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'multivariate',
    title: '多変量解析',
    description: '複数変数の同時分析',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'viz-libs',
    title: '可視化ライブラリ',
    description: 'Matplotlib/Seaborn/Plotly',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 教師あり学習（回帰） - 小分類
  {
    id: 'linear-regression',
    title: '単回帰・重回帰分析',
    description: '線形回帰モデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'regularized-regression',
    title: '正則化回帰',
    description: 'Lasso, Ridge, ElasticNet',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 教師あり学習（分類） - 小分類
  {
    id: 'logistic-regression',
    title: 'ロジスティック回帰',
    description: '二値分類の線形モデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'knn',
    title: 'k近傍法',
    description: 'k-NN分類アルゴリズム',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'svm',
    title: 'サポートベクターマシン',
    description: 'SVM分類モデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'decision-tree',
    title: '決定木',
    description: 'ツリーベースの分類モデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // アンサンブル学習 - 小分類
  {
    id: 'random-forest',
    title: 'ランダムフォレスト',
    description: '決定木のアンサンブル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'gbdt',
    title: '勾配ブースティング決定木',
    description: 'GBDTアルゴリズム',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'xgboost',
    title: 'XGBoost',
    description: '最適化された勾配ブースティング',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'lightgbm',
    title: 'LightGBM',
    description: '高速な勾配ブースティング',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'catboost',
    title: 'CatBoost',
    description: 'カテゴリ特徴量に強い勾配ブースティング',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 教師なし学習 - 小分類
  {
    id: 'kmeans',
    title: 'k-means',
    description: '代表的なクラスタリングアルゴリズム',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'hierarchical-clustering',
    title: '階層的クラスタリング',
    description: '階層構造を持つクラスタリング',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'dbscan',
    title: 'DBSCAN',
    description: '密度ベースのクラスタリング',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'pca',
    title: '主成分分析',
    description: 'PCAによる次元削減',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'tsne',
    title: 't-SNE',
    description: '非線形次元削減',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'umap',
    title: 'UMAP',
    description: '統一多様体近似と投影',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'association',
    title: 'アソシエーション分析',
    description: '相関ルールマイニング',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 時系列解析 - 小分類
  {
    id: 'arima',
    title: 'ARIMA / SARIMA',
    description: '時系列予測モデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'state-space',
    title: '状態空間モデル',
    description: '時系列の状態空間表現',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'prophet',
    title: 'Prophet',
    description: 'Facebookの時系列予測ツール',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // モデル評価・最適化 - 小分類
  {
    id: 'metrics',
    title: '評価指標',
    description: 'RMSE, AUC, Accuracy, Precision, Recall, F1-score',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'cross-validation',
    title: '交差検証',
    description: 'Cross Validation',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'grid-search',
    title: 'Grid Search / Random Search',
    description: 'ハイパーパラメータ探索',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'optuna',
    title: 'ベイズ最適化',
    description: 'Optunaによるハイパーパラメータ最適化',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // ニューラルネットワーク基礎 - 小分類
  {
    id: 'perceptron',
    title: 'パーセプトロン',
    description: 'ニューラルネットワークの基本単位',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'activation',
    title: '活性化関数',
    description: 'ReLU, Sigmoid, Softmax',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'backprop',
    title: '誤差逆伝播法',
    description: 'ニューラルネットワークの学習アルゴリズム',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 画像認識 - 小分類
  {
    id: 'cnn',
    title: 'CNN',
    description: '畳み込みニューラルネットワーク',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'resnet',
    title: 'ResNet',
    description: '残差ネットワーク',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'efficientnet',
    title: 'EfficientNet',
    description: '効率的なCNNアーキテクチャ',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'yolo',
    title: 'YOLO',
    description: 'リアルタイム物体検出',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 自然言語処理 - 小分類
  {
    id: 'morphological',
    title: '形態素解析',
    description: 'テキストの形態素解析',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'word2vec',
    title: 'Word2Vec',
    description: '単語埋め込み表現',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'rnn',
    title: 'RNN / LSTM',
    description: '再帰型ニューラルネットワーク',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'transformer',
    title: 'Transformer',
    description: 'Attention機構によるモデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'bert',
    title: 'BERT',
    description: '双方向エンコーダー表現',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'gpt',
    title: 'GPT',
    description: '生成型事前学習トランスフォーマー',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'llama',
    title: 'LLaMA',
    description: 'Metaの大規模言語モデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'rag',
    title: 'RAG',
    description: '検索拡張生成',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 生成AI - 小分類
  {
    id: 'gans',
    title: 'GANs',
    description: '敵対的生成ネットワーク',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'diffusion',
    title: 'Diffusion Models',
    description: '拡散モデル',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // MLOps - 小分類
  {
    id: 'deployment',
    title: 'モデルのデプロイ',
    description: 'API化: FastAPI, Flask',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'pipeline',
    title: 'パイプライン管理',
    description: 'Airflow, Kubeflow',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'experiment-tracking',
    title: '実験管理',
    description: 'MLflow, Weights & Biases',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'monitoring',
    title: 'モデル監視・再学習',
    description: 'モデルの運用監視と継続的改善',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // ビジネス実装 - 小分類
  {
    id: 'problem-definition',
    title: '課題定義・KPI設計',
    description: 'ビジネス課題の明確化と指標設計',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'ab-testing',
    title: 'A/Bテスト',
    description: '仮説検証のための実験設計',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'causal-inference',
    title: '因果推論',
    description: '因果関係の推定',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },

  // 倫理・法務 - 小分類
  {
    id: 'ai-ethics',
    title: 'AI倫理・バイアス',
    description: '公平性とバイアスの問題',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
  {
    id: 'privacy',
    title: '個人情報保護',
    description: '個人情報保護法・GDPR',
    tier: 3,
    color: '#ffff00',
    resources: [],
  },
];

// Generate links between nodes (hierarchical structure)
export const links: Link[] = [
  // Tier 1 to Tier 2 connections (Galaxy to Sector)
  
  // 数学・統計学の基礎
  { source: 'math-stats', target: 'descriptive-stats' },
  { source: 'math-stats', target: 'probability' },
  { source: 'math-stats', target: 'inferential-stats' },
  { source: 'math-stats', target: 'linear-algebra' },
  
  // コンピュータサイエンス・エンジニアリング
  { source: 'engineering', target: 'programming' },
  { source: 'engineering', target: 'data-libs' },
  { source: 'engineering', target: 'database' },
  { source: 'engineering', target: 'devops' },
  
  // データ前処理・EDA
  { source: 'data-prep', target: 'data-collection' },
  { source: 'data-prep', target: 'preprocessing' },
  { source: 'data-prep', target: 'eda' },
  
  // 機械学習：モデリング
  { source: 'ml', target: 'supervised-regression' },
  { source: 'ml', target: 'supervised-classification' },
  { source: 'ml', target: 'ensemble' },
  { source: 'ml', target: 'unsupervised' },
  { source: 'ml', target: 'time-series' },
  { source: 'ml', target: 'model-eval' },
  
  // ディープラーニング・AI
  { source: 'deep-learning', target: 'nn-basics' },
  { source: 'deep-learning', target: 'computer-vision' },
  { source: 'deep-learning', target: 'nlp' },
  { source: 'deep-learning', target: 'generative-ai' },
  
  // ビジネス応用・MLOps
  { source: 'business-mlops', target: 'mlops' },
  { source: 'business-mlops', target: 'business' },
  { source: 'business-mlops', target: 'ethics' },
  
  // Tier 2 to Tier 3 connections (Sector to Planet)
  
  // 記述統計学
  { source: 'descriptive-stats', target: 'central-tendency' },
  { source: 'descriptive-stats', target: 'dispersion' },
  { source: 'descriptive-stats', target: 'data-viz-basic' },
  
  // 確率・確率分布
  { source: 'probability', target: 'random-variable' },
  { source: 'probability', target: 'distributions' },
  { source: 'probability', target: 'bayesian-stats' },
  
  // 推測統計学
  { source: 'inferential-stats', target: 'estimation' },
  { source: 'inferential-stats', target: 'hypothesis-testing' },
  { source: 'inferential-stats', target: 'p-value' },
  { source: 'inferential-stats', target: 'power-analysis' },
  
  // 線形代数・微分積分
  { source: 'linear-algebra', target: 'matrix-vector' },
  { source: 'linear-algebra', target: 'partial-derivative' },
  { source: 'linear-algebra', target: 'matrix-decomposition' },
  
  // プログラミング基礎
  { source: 'programming', target: 'python-basics' },
  { source: 'programming', target: 'r-basics' },
  { source: 'programming', target: 'env-setup' },
  
  // データ操作ライブラリ
  { source: 'data-libs', target: 'numpy' },
  { source: 'data-libs', target: 'pandas' },
  { source: 'data-libs', target: 'polars' },
  
  // データベース・SQL
  { source: 'database', target: 'rdb' },
  { source: 'database', target: 'sql' },
  { source: 'database', target: 'nosql' },
  
  // Linux・シェル・Git
  { source: 'devops', target: 'linux-shell' },
  { source: 'devops', target: 'git' },
  
  // データ収集
  { source: 'data-collection', target: 'web-scraping' },
  { source: 'data-collection', target: 'api' },
  
  // データ前処理
  { source: 'preprocessing', target: 'missing-values' },
  { source: 'preprocessing', target: 'outliers' },
  { source: 'preprocessing', target: 'encoding' },
  { source: 'preprocessing', target: 'scaling' },
  
  // 探索的データ分析
  { source: 'eda', target: 'correlation' },
  { source: 'eda', target: 'multivariate' },
  { source: 'eda', target: 'viz-libs' },
  
  // 教師あり学習（回帰）
  { source: 'supervised-regression', target: 'linear-regression' },
  { source: 'supervised-regression', target: 'regularized-regression' },
  
  // 教師あり学習（分類）
  { source: 'supervised-classification', target: 'logistic-regression' },
  { source: 'supervised-classification', target: 'knn' },
  { source: 'supervised-classification', target: 'svm' },
  { source: 'supervised-classification', target: 'decision-tree' },
  
  // アンサンブル学習
  { source: 'ensemble', target: 'random-forest' },
  { source: 'ensemble', target: 'gbdt' },
  { source: 'ensemble', target: 'xgboost' },
  { source: 'ensemble', target: 'lightgbm' },
  { source: 'ensemble', target: 'catboost' },
  
  // 教師なし学習
  { source: 'unsupervised', target: 'kmeans' },
  { source: 'unsupervised', target: 'hierarchical-clustering' },
  { source: 'unsupervised', target: 'dbscan' },
  { source: 'unsupervised', target: 'pca' },
  { source: 'unsupervised', target: 'tsne' },
  { source: 'unsupervised', target: 'umap' },
  { source: 'unsupervised', target: 'association' },
  
  // 時系列解析
  { source: 'time-series', target: 'arima' },
  { source: 'time-series', target: 'state-space' },
  { source: 'time-series', target: 'prophet' },
  
  // モデル評価・最適化
  { source: 'model-eval', target: 'metrics' },
  { source: 'model-eval', target: 'cross-validation' },
  { source: 'model-eval', target: 'grid-search' },
  { source: 'model-eval', target: 'optuna' },
  
  // ニューラルネットワーク基礎
  { source: 'nn-basics', target: 'perceptron' },
  { source: 'nn-basics', target: 'activation' },
  { source: 'nn-basics', target: 'backprop' },
  
  // 画像認識
  { source: 'computer-vision', target: 'cnn' },
  { source: 'computer-vision', target: 'resnet' },
  { source: 'computer-vision', target: 'efficientnet' },
  { source: 'computer-vision', target: 'yolo' },
  
  // 自然言語処理
  { source: 'nlp', target: 'morphological' },
  { source: 'nlp', target: 'word2vec' },
  { source: 'nlp', target: 'rnn' },
  { source: 'nlp', target: 'transformer' },
  { source: 'nlp', target: 'bert' },
  { source: 'nlp', target: 'gpt' },
  { source: 'nlp', target: 'llama' },
  { source: 'nlp', target: 'rag' },
  
  // 生成AI
  { source: 'generative-ai', target: 'gans' },
  { source: 'generative-ai', target: 'diffusion' },
  
  // MLOps
  { source: 'mlops', target: 'deployment' },
  { source: 'mlops', target: 'pipeline' },
  { source: 'mlops', target: 'experiment-tracking' },
  { source: 'mlops', target: 'monitoring' },
  
  // ビジネス実装
  { source: 'business', target: 'problem-definition' },
  { source: 'business', target: 'ab-testing' },
  { source: 'business', target: 'causal-inference' },
  
  // 倫理・法務
  { source: 'ethics', target: 'ai-ethics' },
  { source: 'ethics', target: 'privacy' },
  
  // Cross-domain connections (重要な関連性)
  { source: 'linear-algebra', target: 'pca' },
  { source: 'linear-algebra', target: 'matrix-decomposition' },
  { source: 'probability', target: 'bayesian-stats' },
  { source: 'python-basics', target: 'numpy' },
  { source: 'python-basics', target: 'pandas' },
  { source: 'numpy', target: 'pandas' },
  { source: 'decision-tree', target: 'random-forest' },
  { source: 'decision-tree', target: 'gbdt' },
  { source: 'pca', target: 'unsupervised' },
  { source: 'cnn', target: 'computer-vision' },
  { source: 'transformer', target: 'bert' },
  { source: 'transformer', target: 'gpt' },
  { source: 'model-eval', target: 'mlops' },
];

