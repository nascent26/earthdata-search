#= require models/data/query
#= require models/data/project
#= require models/data/preferences
#= require models/ui/temporal
#= require models/ui/project_list
#= require models/ui/service_options_list
#= require models/ui/feedback
#= require models/ui/sitetour
#= require models/ui/granules_list

data = @edsc.models.data
ui = @edsc.models.ui
ns = @edsc.models.page

ns.ProjectPage = do (ko,
  setCurrent = ns.setCurrent
  urlUtil = @edsc.util.url
  QueryModel = data.query.CollectionQuery
  ProjectModel = data.Project
  PreferencesModel = data.Preferences
  TemporalModel = ui.Temporal
  ProjectListModel = ui.ProjectList
  SiteTourModel = ui.SiteTour
  ServiceOptionsListModel = ui.ServiceOptionsList
  FeedbackModel = ui.Feedback
  ajax=@edsc.util.xhr.ajax
  GranulesList = ui.GranulesList
) ->

  class ProjectPage
    constructor: ->
      @query = new QueryModel()
      @project = new ProjectModel(@query)
      @projectQuery =
      @id = window.location.href.match(/\/projects\/(\d+)$/)?[1]
      @bindingsLoaded = ko.observable(false)
      @preferences = new PreferencesModel()
      @workspaceName = ko.observable(null)
      @workspaceNameField = ko.observable(null)
      @projectSummary = ko.computed(@_computeProjectSummary, this, deferEvaluation: true)
      @isLoaded = ko.observable(false)

      projectList = new ProjectListModel(@project)
      @ui =
        temporal: new TemporalModel(@query)
        projectList: projectList
        feedback: new FeedbackModel()
        sitetour: new SiteTourModel()

      $(window).on 'edsc.save_workspace', (e)=>
        urlUtil.saveState('/search/collections', urlUtil.currentParams(), true, @workspaceNameField())
        @workspaceName(@workspaceNameField())
        $('.save-dropdown').removeClass('open')

      setTimeout((=>
        @_loadFromUrl()
        $(window).on 'edsc.pagechange', @_loadFromUrl), 0)

    _loadFromUrl: (e)=>
      @project.serialized(urlUtil.currentParams())
      @workspaceName(urlUtil.getProjectName())

    _computeProjectSize: ->
      if @project.collections?().length > 0
        totalSizeInMB = 0.0
        for collection in @project.collections()
          totalSizeInMB += collection['total_size']
        @_convertSize(totalSizeInMB)

    _computeProjectSummary: ->
      if @project.collections?().length > 0
        projectGranules = 0
        projectSize = 0.0
        loadedCollectionNum = 0
        for collection in @project.collections()
          granules = collection.cmrGranulesModel
          if granules.isLoaded()
            loadedCollectionNum += 1
            _size = 0
            _size += parseFloat(granule.granule_size) for granule in granules.results()
            totalSize = _size / granules.results().length * granules.hits()
            projectGranules += granules.hits()
            collection.granule_hits(granules.hits())
            projectSize += totalSize
            collection.total_size(@_convertSize(totalSize)['size'])
            collection.unit(@_convertSize(totalSize)['unit'])

        @isLoaded(true) if loadedCollectionNum == @project.collections?().length

        {projectGranules: projectGranules, projectSize: @_convertSize(projectSize)}

    _convertSize: (_size) ->
      _units = ['MB', 'GB', 'TB', 'PB', 'EB']
      while _size > 1024 && _units.length > 1
        _size = parseFloat(_size) / 1024
        _units.shift()
      {size: _size.toFixed(1), unit: _units[0]}

  setCurrent(new ProjectPage())

  exports = ProjectPage
