//the problem we are noticing is that sources can be interpreted in many different ways.
//there are different types of sources, fundementally 3.
//string/buffer/linear, hierarchical, stream
//there are also several cases where one type can become another through a series of transformations
//the prototypical case of this is the JSON string, where the source is a string, but this string can be parsed to represent hierarchical
//information.

//A data type is a series of actions(transformations) which can be applied to data.

//a source type is a description of the type of data which can be extract from a source?
//this is based on a sources extension.

//Does a string type have to acknowledge that it can *might* be able to be transformed into an object?
//Given a string its self, we cannot actually know this with out trying.
//But given a named string, (a file with a path), it may be possible to
//extract this information, as files have extensions that indicate type (.json)


//Another instance of this is the directory, which when accessed via the filesystem api provides
//an array of strings, where the strings are names of children of the directory.

//this case is less a case of, directories are both an array of strings and a hashtable,
//but more an instance of, when a directory (a source) is accessed, it provides a set of data which
//can be used to access data related to the directory (each string is a name in the directory, so
//fs.readdir is a case of Object.keys)
//a hash table is then an abstract data type that is made up of an array of keys, and a list of values
//associated with those keys
/*
 struct {
   
 }
 */
    //A collection of values and functions.
    //A string containing valid javascipt.
//objects are actually instances of a more simplistic abstract data type, the hash table, or collection.
//objects are hashtables that are expected to have functions as members, and said functions inherit
//the scope of the object through the keyword "this"

//a hash table is a collection of arbitrary values indexed by strings
//hash tables even still are instances of simpler types, the unordered list.

//the unordered list is a collection of values indexed by arbitrary key values that has no
//absolute order (because of the nature of machine memory, there is technically an order that they would
//be accessed, the lack of an absolute order is to say that the order that exists cannot be relied upon,//and is likely arbitrary)
module.exports = {
    object:require("./object.js"),
    array:require("./array.js"),
    string:require("./string.js"),
    function:require("./function.js")
}
