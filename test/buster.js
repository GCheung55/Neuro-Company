var config = module.exports;

config["Neuro-Company"] = {
    rootPath: "../",
    environment: "browser", // or "node"
    sources: [
        "test/assets/js/mootools-core.js",
        "neuro-company.js"
    ],
    tests: [
        // "test/*-test.js"
        // "test/view-test.js",
        "test/model-test.js",
        "test/collection-test.js"
    ]
};