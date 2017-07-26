module.exports = (grunt) => {
  require("load-grunt-tasks")(grunt)

  grunt.initConfig({
    mochaTest: {
      specs: {
        options: {
          ui: "bdd",
          reporter: "spec",
        },
        src: ["./specs/**/*.spec.js"]
      }
    },
    watch: {
      scripts: {
        files: ["./src/**/*.js", "Gruntfile.js"],
        tasks: ["mochaTest"],
        options: {
          atBegin: true,
          reload: true
        }
      }
    }
  })
  grunt.registerTask("test", [
    "mochaTest"
  ])
  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-mocha-test")
}
