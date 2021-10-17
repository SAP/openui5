var info = {
    "old.module.exports": module.exports,
    "old.exports": exports
};
module.exports = info["new.module.exports"] = info;