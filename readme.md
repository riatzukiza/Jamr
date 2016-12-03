# Jamr

This is a little markov chain text generator I wrote a while ago.

To get it to run on the sample inputs:
```sh
node ./run.js -i ./big-input.txt -o ./big-output.txt -n 5 -s 100
```

where n is the amount of context to give the robot, and s is how many words to generate once the model has been built.
the larger the value of n, the more data should be provided, otherwise it will generate nearly exact quotes from the corpus.
