test:
	make test-local

test-local:
	(echo test/*_spec.js && . ./.env && ./node_modules/.bin/mocha ./test/index.js)

test-ci:
	(echo test/*_spec.js && . ./.env && ./node_modules/.bin/mocha ./test/index.js --reporter dot --ignore-leaks)

.PHONY: test