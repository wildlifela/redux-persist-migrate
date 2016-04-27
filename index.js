function createMigration(manifest) {

  var migrationTransform = createTransform()
  return {
    transform: migrationTransform,
    preloader: migrationPreloader,
  }
}

module.exports = createMigration
