export const POWERED_BY = 'portkey';
export const MAX_RETRY_LIMIT_MS = 60 * 1000; // 60 seconds
export const POSSIBLE_RETRY_STATUS_HEADERS = [
    'retry-after-ms',
    'x-ms-retry-after-ms',
    'retry-after',
];
export const HEADER_KEYS = {
    MODE: `x-${POWERED_BY}-mode`,
    RETRIES: `x-${POWERED_BY}-retry-count`,
    PROVIDER: `x-${POWERED_BY}-provider`,
    CONFIG: `x-${POWERED_BY}-config`,
    TRACE_ID: `x-${POWERED_BY}-trace-id`,
    CACHE: `x-${POWERED_BY}-cache`,
    METADATA: `x-${POWERED_BY}-metadata`,
    FORWARD_HEADERS: `x-${POWERED_BY}-forward-headers`,
    CUSTOM_HOST: `x-${POWERED_BY}-custom-host`,
    REQUEST_TIMEOUT: `x-${POWERED_BY}-request-timeout`,
    STRICT_OPEN_AI_COMPLIANCE: `x-${POWERED_BY}-strict-open-ai-compliance`,
    CONTENT_TYPE: `Content-Type`,
};
export const RESPONSE_HEADER_KEYS = {
    RETRY_ATTEMPT_COUNT: `x-${POWERED_BY}-retry-attempt-count`,
    LAST_USED_OPTION_INDEX: `x-${POWERED_BY}-last-used-option-index`,
    LAST_USED_OPTION_PARAMS: `x-${POWERED_BY}-last-used-option-params`,
    CACHE_STATUS: `x-${POWERED_BY}-cache-status`,
    TRACE_ID: `x-${POWERED_BY}-trace-id`,
};
export const RETRY_STATUS_CODES = [429, 500, 502, 503, 504];
export const MAX_RETRIES = 5;
export const REQUEST_TIMEOUT_STATUS_CODE = 408;
export const PRECONDITION_CHECK_FAILED_STATUS_CODE = 412;
export const OPEN_AI = 'openai';
export const COHERE = 'cohere';
export const AZURE_OPEN_AI = 'azure-openai';
export const AZURE_AI_INFERENCE = 'azure-ai';
export const ANTHROPIC = 'anthropic';
export const ANYSCALE = 'anyscale';
export const PALM = 'palm';
export const TOGETHER_AI = 'together-ai';
export const GOOGLE = 'google';
export const GOOGLE_VERTEX_AI = 'vertex-ai';
export const HUGGING_FACE = 'huggingface';
export const PERPLEXITY_AI = 'perplexity-ai';
export const REKA_AI = 'reka-ai';
export const MISTRAL_AI = 'mistral-ai';
export const DEEPINFRA = 'deepinfra';
export const NCOMPASS = 'ncompass';
export const STABILITY_AI = 'stability-ai';
export const NOMIC = 'nomic';
export const OLLAMA = 'ollama';
export const AI21 = 'ai21';
export const BEDROCK = 'bedrock';
export const GROQ = 'groq';
export const SEGMIND = 'segmind';
export const JINA = 'jina';
export const FIREWORKS_AI = 'fireworks-ai';
export const WORKERS_AI = 'workers-ai';
export const MOONSHOT = 'moonshot';
export const OPENROUTER = 'openrouter';
export const LINGYI = 'lingyi';
export const ZHIPU = 'zhipu';
export const NOVITA_AI = 'novita-ai';
export const MONSTERAPI = 'monsterapi';
export const DEEPSEEK = 'deepseek';
export const PREDIBASE = 'predibase';
export const TRITON = 'triton';
export const VOYAGE = 'voyage';
export const GITHUB = 'github';
export const DEEPBRICKS = 'deepbricks';
export const SILICONFLOW = 'siliconflow';
export const CEREBRAS = 'cerebras';
export const INFERENCENET = 'inference-net';
export const SAMBANOVA = 'sambanova';
export const LEMONFOX_AI = 'lemonfox-ai';
export const UPSTAGE = 'upstage';
export const LAMBDA = 'lambda';
export const DASHSCOPE = 'dashscope';
export const X_AI = 'x-ai';
export const CORTEX = 'cortex';
export const SAGEMAKER = 'sagemaker';
export const NEBIUS = 'nebius';
export const RECRAFTAI = 'recraft-ai';
export const MILVUS = 'milvus';
export const REPLICATE = 'replicate';
export const LEPTON = 'lepton';
export const NSCALE = 'nscale';
export const VALID_PROVIDERS = [
    ANTHROPIC,
    ANYSCALE,
    AZURE_OPEN_AI,
    COHERE,
    GOOGLE,
    GOOGLE_VERTEX_AI,
    MISTRAL_AI,
    OPEN_AI,
    PALM,
    PERPLEXITY_AI,
    REKA_AI,
    TOGETHER_AI,
    DEEPINFRA,
    NCOMPASS,
    STABILITY_AI,
    NOMIC,
    OLLAMA,
    AI21,
    BEDROCK,
    GROQ,
    SEGMIND,
    JINA,
    FIREWORKS_AI,
    WORKERS_AI,
    MOONSHOT,
    OPENROUTER,
    LINGYI,
    ZHIPU,
    NOVITA_AI,
    MONSTERAPI,
    DEEPSEEK,
    PREDIBASE,
    TRITON,
    VOYAGE,
    AZURE_AI_INFERENCE,
    GITHUB,
    DEEPBRICKS,
    SILICONFLOW,
    HUGGING_FACE,
    CEREBRAS,
    INFERENCENET,
    SAMBANOVA,
    LEMONFOX_AI,
    UPSTAGE,
    LAMBDA,
    DASHSCOPE,
    X_AI,
    CORTEX,
    SAGEMAKER,
    NEBIUS,
    RECRAFTAI,
    MILVUS,
    REPLICATE,
    POWERED_BY,
    LEPTON,
    NSCALE,
];
export const CONTENT_TYPES = {
    APPLICATION_JSON: 'application/json',
    MULTIPART_FORM_DATA: 'multipart/form-data',
    EVENT_STREAM: 'text/event-stream',
    AUDIO_MPEG: 'audio/mpeg',
    APPLICATION_OCTET_STREAM: 'application/octet-stream',
    BINARY_OCTET_STREAM: 'binary/octet-stream',
    GENERIC_AUDIO_PATTERN: 'audio',
    PLAIN_TEXT: 'text/plain',
    HTML: 'text/html',
    GENERIC_IMAGE_PATTERN: 'image/',
};
export const MULTIPART_FORM_DATA_ENDPOINTS = [
    'createTranscription',
    'createTranslation',
    'uploadFile',
];
export const fileExtensionMimeTypeMap = {
    mp4: 'video/mp4',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    png: 'image/png',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
    webp: 'image/webp',
    pdf: 'application/pdf',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    html: 'text/html',
    md: 'text/markdown',
    mp3: 'audio/mp3',
    wav: 'audio/wav',
    txt: 'text/plain',
    mov: 'video/mov',
    mpeg: 'video/mpeg',
    mpg: 'video/mpg',
    avi: 'video/avi',
    wmv: 'video/wmv',
    mpegps: 'video/mpegps',
    flv: 'video/flv',
    webm: 'video/webm',
};
export const imagesMimeTypes = [
    fileExtensionMimeTypeMap.jpeg,
    fileExtensionMimeTypeMap.jpg,
    fileExtensionMimeTypeMap.png,
    fileExtensionMimeTypeMap.bmp,
    fileExtensionMimeTypeMap.tiff,
    fileExtensionMimeTypeMap.webp,
];
export const documentMimeTypes = [
    fileExtensionMimeTypeMap.pdf,
    fileExtensionMimeTypeMap.csv,
    fileExtensionMimeTypeMap.doc,
    fileExtensionMimeTypeMap.docx,
    fileExtensionMimeTypeMap.xls,
    fileExtensionMimeTypeMap.xlsx,
    fileExtensionMimeTypeMap.html,
    fileExtensionMimeTypeMap.md,
    fileExtensionMimeTypeMap.txt,
];
