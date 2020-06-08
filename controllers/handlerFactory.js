// global response handler functions

const filterQuery = (query)=> {
    const excludeObj = ['page','sort','limit'];
    const filterObj = {
        page: query.page,
        limit: query.limit,
        sort: query.sort
    } 
    excludeObj.forEach(el => delete query[el])
    return { filterObj, query }
}

const pagination = (query, numResult)=> {
    let sortBy = '-createdAt'
    if(query.sort)
    {
        sortBy = query.sort.replace(/,/g, ' ')
    }
    const page = Number(query.page) || 1
    const limit = Number(query.limit ) || 100
    const skip = (page-1)*limit
    if(skip>=numResult)
    {
        throw new Error('This page does not exist')
    }
    return {sortBy, limit, skip}
}

const getAll = (Model, filePath) => {
    return async (req,res,next)=> {
        try {
            const newQuery = filterQuery(req.query)
            const numDocs = await Model.countDocuments(newQuery.query)
            const filter = pagination(newQuery.filterObj, numDocs)
            const docs = await Model.find(newQuery.query).sort(filter.sortBy).limit(filter.limit).skip(filter.skip)
            res.render(filePath, { docs })
        }
        catch(e)
        {
            res.status(400).send(e.message)
        }
    }
}

const getOne = (Model, filePath) => {
    return async (req,res,next)=> {
        try {
            const doc = await Model.findById(req.params.id)
            if(!doc)
            {
                throw new Error("No document found by this Id")
            }
            res.render(filePath, { doc })      
        }
        catch(e)
        {
            req.flash('error', e.message)
            res.render('/tours')
        }
    }
}

const createOne = (Model) => {
    return async(req,res,next)=> {
        try {
            const doc = await Model.create(req.body)
            res.status(201).send({
                status: 'success',
                data: {
                    data: doc
                }
            })
        }
        catch(e)
        {
            res.status(400).send(e.message)
        }
    }
}

const deleteOne = (Model)=> {
    return async(req,res)=> {
        try {
            const doc = await Model.findByIdAndDelete(req.params.id)
            if(!doc)
            {
                return res.status(404).send("no document found with that Id")
            }
            res.status(204).send({
                status: 'success',
                data: null
            })
        }
        catch(e)
        {
            res.status(400).send(e)
        }
    }
}

const updateOne = (Model) => {
    return async (req,res)=> {
        try {
            const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
            if(!doc)
            {
                return res.status(404).send('No doc was found.')
            }
            res.send({
                status: 'success',
                data: {
                    data: doc
                }
            })
        }
        catch(e)
        {
            res.status(400).send(e)
        }
    }
}

module.exports = {
    getAll,
    createOne,
    getOne,
    deleteOne,
    updateOne
}