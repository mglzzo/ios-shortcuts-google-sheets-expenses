[33mcommit 8dd8714d5aede5900d25bc05404983bc376830ad[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m, [m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m)[m
Author: mglzzo <martinsmiguel90@gmail.com>
Date:   Wed Sep 9 10:49:37 2026 -0300

    feat: adiciona rotas de transações e importação por planilha

[1mdiff --git a/categorizar.ts b/categorizar.ts[m
[1mindex 1c14fbd..e409b91 100644[m
[1m--- a/categorizar.ts[m
[1m+++ b/categorizar.ts[m
[36m@@ -156,7 +156,7 @@[m [mfunction mapearCategoriaGenerica([m
 }[m
 [m
 [m
[31m-async function buscarCategoriaIdPorNome([m
[32m+[m[32mexport async function buscarCategoriaIdPorNome([m
   nomeCategoria: string[m
 ): Promise<number | null> {[m
   const categoria =[m
[1mdiff --git a/node_modules/.package-lock.json b/node_modules/.package-lock.json[m
[1mindex b38811d..31a4700 100644[m
[1m--- a/node_modules/.package-lock.json[m
[1m+++ b/node_modules/.package-lock.json[m
[36m@@ -174,6 +174,47 @@[m
         "node": ">=18"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/@fast-csv/format": {[m
[32m+[m[32m      "version": "4.3.5",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@fast-csv/format/-/format-4.3.5.tgz",[m
[32m+[m[32m      "integrity": "sha512-8iRn6QF3I8Ak78lNAa+Gdl5MJJBM5vRHivFtMRUWINdevNo00K7OXxS2PshawLKTejVwieIlPmK5YlLu6w4u8A==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@types/node": "^14.0.1",[m
[32m+[m[32m        "lodash.escaperegexp": "^4.1.2",[m
[32m+[m[32m        "lodash.isboolean": "^3.0.3",[m
[32m+[m[32m        "lodash.isequal": "^4.5.0",[m
[32m+[m[32m        "lodash.isfunction": "^3.0.9",[m
[32m+[m[32m        "lodash.isnil": "^4.0.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/@fast-csv/format/node_modules/@types/node": {[m
[32m+[m[32m      "version": "14.18.63",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@types/node/-/node-14.18.63.tgz",[m
[32m+[m[32m      "integrity": "sha512-fAtCfv4jJg+ExtXhvCkCqUKZ+4ok/JQk01qDKhL5BDDoS3AxKXhV5/MAVUZyQnSEd2GT92fkgZl0pz0Q0AzcIQ==",[m
[32m+[m[32m      "license": "MIT"[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/@fast-csv/parse": {[m
[32m+[m[32m      "version": "4.3.6",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@fast-csv/parse/-/parse-4.3.6.tgz",[m
[32m+[m[32m      "integrity": "sha512-uRsLYksqpbDmWaSmzvJcuApSEe38+6NQZBUsuAyMZKqHxH0g1wcJgsKUvN3WC8tewaqFjBMMGrkHmC+T7k8LvA==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@types/node": "^14.0.1",[m
[32m+[m[32m        "lodash.escaperegexp": "^4.1.2",[m
[32m+[m[32m        "lodash.groupby": "^4.6.0",[m
[32m+[m[32m        "lodash.isfunction": "^3.0.9",[m
[32m+[m[32m        "lodash.isnil": "^4.0.0",[m
[32m+[m[32m        "lodash.isundefined": "^3.0.1",[m
[32m+[m[32m        "lodash.uniq": "^4.5.0"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/@fast-csv/parse/node_modules/@types/node": {[m
[32m+[m[32m      "version": "14.18.63",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@types/node/-/node-14.18.63.tgz",[m
[32m+[m[32m      "integrity": "sha512-fAtCfv4jJg+ExtXhvCkCqUKZ+4ok/JQk01qDKhL5BDDoS3AxKXhV5/MAVUZyQnSEd2GT92fkgZl0pz0Q0AzcIQ==",[m
[32m+[m[32m      "license": "MIT"[m
[32m+[m[32m    },[m
     "node_modules/@img/colour": {[m
       "version": "1.1.0",[m
       "resolved": "https://registry.npmjs.org/@img/colour/-/colour-1.1.0.tgz",[m
[36m@@ -378,6 +419,16 @@[m
       "dev": true,[m
       "license": "MIT"[m
     },[m
[32m+[m[32m    "node_modules/@types/multer": {[m
[32m+[m[32m      "version": "2.2.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/@types/multer/-/multer-2.2.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-3U1troeqGV8Ntp7Q3klwf4zr23VEoqYVocYXaswm9+8z3O9UHDYAqLxjJ/h550iRADTjKdOdhhasXw6gD6kYtg==",[m
[32m+[m[32m      "dev": true,[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "@types/express": "*"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
     "node_modules/@types/node": {[m
       "version": "26.4.1",[m
       "resolved": "https://registry.npmjs.org/@types/node/-/node-26.4.1.tgz",[m
[36m@@ -436,6 +487,113 @@[m
         "node": ">= 0.6"[m
       }[m
     },[m
[32m+[m[32m    "node_modules/append-field": {[m
[32m+[m[32m      "version": "1.0.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/append-field/-/append-field-1.0.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-klpgFSWLW1ZEs8svjfb7g4qWY0YS5imI82dTg+QahUvJ8YqAY0P10Uk8tTyh9ZGuYEZEMaeJYCF5BFuX552hsw==",[m
[32m+[m[32m      "license": "MIT"[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/archiver": {[m
[32m+[m[32m      "version": "5.3.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/archiver/-/archiver-5.3.2.tgz",[m
[32m+[m[32m      "integrity": "sha512-+25nxyyznAXF7Nef3y0EbBeqmGZgeN/BxHX29Rs39djAfaFalmQ89SE6CWyDCHzGL0yt/ycBtNOmGTW0FyGWNw==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "archiver-utils": "^2.1.0",[m
[32m+[m[32m        "async": "^3.2.4",[m
[32m+[m[32m        "buffer-crc32": "^0.2.1",[m
[32m+[m[32m        "readable-stream": "^3.6.0",[m
[32m+[m[32m        "readdir-glob": "^1.1.2",[m
[32m+[m[32m        "tar-stream": "^2.2.0",[m
[32m+[m[32m        "zip-stream": "^4.1.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">= 10"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/archiver-utils": {[m
[32m+[m[32m      "version": "2.1.0",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/archiver-utils/-/archiver-utils-2.1.0.tgz",[m
[32m+[m[32m      "integrity": "sha512-bEL/yUb/fNNiNTuUz979Z0Yg5L+LzLxGJz8x79lYmR54fmTIb6ob/hNQgkQnIUDWIFjZVQwl9Xs356I6BAMHfw==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "glob": "^7.1.4",[m
[32m+[m[32m        "graceful-fs": "^4.2.0",[m
[32m+[m[32m        "lazystream": "^1.0.0",[m
[32m+[m[32m        "lodash.defaults": "^4.2.0",[m
[32m+[m[32m        "lodash.difference": "^4.5.0",[m
[32m+[m[32m        "lodash.flatten": "^4.4.0",[m
[32m+[m[32m        "lodash.isplainobject": "^4.0.6",[m
[32m+[m[32m        "lodash.union": "^4.6.0",[m
[32m+[m[32m        "normalize-path": "^3.0.0",[m
[32m+[m[32m        "readable-stream": "^2.0.0"[m
[32m+[m[32m      },[m
[32m+[m[32m      "engines": {[m
[32m+[m[32m        "node": ">= 6"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/archiver-utils/node_modules/readable-stream": {[m
[32m+[m[32m      "version": "2.3.8",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/readable-stream/-/readable-stream-2.3.8.tgz",[m
[32m+[m[32m      "integrity": "sha512-8p0AUk4XODgIewSi0l8Epjs+EVnWiK7NoDIEGU0HhE7+ZyY8D1IMY7odu5lRrFXGg71L15KG8QrPmum45RTtdA==",[m
[32m+[m[32m      "license": "MIT",[m
[32m+[m[32m      "dependencies": {[m
[32m+[m[32m        "core-util-is": "~1.0.0",[m
[32m+[m[32m        "inherits": "~2.0.3",[m
[32m+[m[32m        "isarray": "~1.0.0",[m
[32m+[m[32m        "process-nextick-args": "~2.0.0",[m
[32m+[m[32m        "safe-buffer": "~5.1.1",[m
[32m+[m[32m        "string_decoder": "~1.1.1",[m
[32m+[m[32m        "util-deprecate": "~1.0.1"[m
[32m+[m[32m      }[m
[32m+[m[32m    },[m
[32m+[m[32m    "node_modules/archiver-utils/node_modules/safe-buffer": {[m
[32m+[m[32m      "version": "5.1.2",[m
[32m+[m[32m      "resolved": "https://registry.npmjs.org/safe-buffer/-/safe-buffer-5.1.2.tgz",[m
[32m+[m[32m      "integrity": "sha512-Gd2UZBJDkXlY7GbJxfsE8/nvKkUEU1G38c1siN6QP6a9PT9MmHB8GnpscSmMJSoF8LOIrt8ud/wPtojys4G6+g==",[m
[32m+[m[32m      "license": "MIT"[m
[