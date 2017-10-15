PATH  := node_modules/.bin:$(PATH)

profile := $(AWS_PROFILE_STOPRDS)
funcName := rds-stop

.PHONY: all clean test dist

all: clean test dist

clean:
	rm -rf dist
	rm -rf archive.zip

node_modules:
	npm install

test: node_modules
	mocha

archive.zip: clean
	mkdir -p dist
	cp -r src/* dist/
	cd dist; chmod -R a+r *; zip -r ../uploads/archive.zip *
	rm -rf dist

dist: archive.zip

deploy: dist
ifndef profile
	@echo "*** Please set AWS_PROFILE_STOPRDS env ***"
else
	mkdir -p info
	@echo "Deploying Lambda Function..."
	aws --profile $(profile) lambda update-function-code \
          --function-name $(funcName) \
          --zip-file "fileb://uploads/archive.zip" > info/lambdaDeploy.json
	@echo "Done!"
endif