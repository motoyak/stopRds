PATH  := node_modules/.bin:$(PATH)

profile := grandseeds-lambda-operator
funcName := rds-stop

.PHONY: all clean test dist

all: clean test dist

clean:
	rm -rf dist
	rm -rf archive.zip

node_modules:
	npm install

test: node_modules
	@NODE_PATH=./lib jasmine

archive.zip: clean
	mkdir -p dist
	cp -r src/* dist/
	cd dist; chmod -R a+r *; zip -r ../archive.zip *
	rm -rf dist

dist: archive.zip

deploy: dist
	mkdir -p info
	@echo "Deploying Lambda Function..."
	aws --profile $(profile) lambda update-function-code \
          --function-name $(funcName) \
          --zip-file "fileb://archive.zip" > info/lambdaDeploy.json
	@echo "Done!"