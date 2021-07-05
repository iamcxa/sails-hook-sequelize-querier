import samples from '../samples';

describe.only('about QueryHelper select operation.', () => {
  it('select should be success', async () => {
    const input = {
      ...samples.group,
      Users: {
        ...samples.user,
        Image: samples.image,
      },
    };

    await Group.create(input, {
      include: [
        {
          model: User,
          include: [Image],
        },
      ],
    });

    const result1 = await QueryHelper
      .select(Group)
      .useScope([])
      .useInclude([{
        model: User,
      }])
      .useAttribute(['name'])
      .useRequest({
        name: 'public',
      })
      .useWhere((request) => ({
        name: request.name,
      }))
      .useSearchable({
        name: 'like',
      })
      .usePresenter((data) => ({
        name: data.name,
        Users: data.Users,
        formating: true,
      }))
      .getPaging({
        curPage: 1,
        perPage: 10,
        sortBy: 'Users.createdAt',
      });

    const result2 = await QueryHelper
      .select(Group)
      .useScope([])
      .useInclude([{
        model: User,
      }])
      .useAttribute(['name'])
      .useRequest({
        name: 'public',
      })
      .useWhere((request) => ({
        name: request.name,
      }))
      .useSearchable({
        name: 'like',
      })
      .usePresenter((data) => ({
        name: data.name,
        Users: data.Users,
        formating: true,
      }))
      .findAll({
        sortBy: 'Users.createdAt',
      });

    result1.items.length.should.gt(0);
    result2.items.length.should.gt(0);
  });

  it('searchable should be success', async () => {
    const input = {
      ...samples.group,
      Users: {
        ...samples.user,
        Image: samples.image,
      },
    };

    await Group.create(input, {
      include: [
        {
          model: User,
          include: [Image],
        },
      ],
    });

    const result1 = await QueryHelper
      .select(Group)
      .useScope([])
      .useInclude([{
        model: User,
      }])
      .useAttribute(['name'])
      .useWhere(() => ({
        name: undefined,
      }))
      .useSearchable({
        name: {
          operator: '<>',
          condition: 'and',
          defaultValue: 'public',
        },
      })
      .usePresenter((data) => ({
        name: data.name,
        Users: data.Users,
        formating: true,
      }))
      .getPaging({
        curPage: 1,
        perPage: 10,
        sortBy: 'Users.createdAt',
      });
    const result2 = await QueryHelper
      .select(Group)
      .useScope([])
      .useInclude([{
        model: User,
      }])
      .useAttribute(['name'])
      .useWhere(() => ({
        name: undefined,
      }))
      .useSearchable({
        name: {
          operator: '<>',
          condition: 'and',
          defaultValue: 'public',
        },
      })
      .usePresenter((data) => ({
        name: data.name,
        Users: data.Users,
        formating: true,
      }))
      .findAll({
        sortBy: 'Users.createdAt',
      });

    result1.items.length.should.equal(0);
    result2.items.length.should.equal(0);
  });

  it('wong searchable should be fail', async () => {
    const input = {
      ...samples.group,
      Users: {
        ...samples.user,
        Image: samples.image,
      },
    };

    await Group.create(input, {
      include: [
        {
          model: User,
          include: [Image],
        },
      ],
    });

    try {
      await QueryHelper
        .select(Group)
        .useScope([])
        .useInclude([{
          model: User,
        }])
        .useAttribute(['name'])
        .useRequest({
          name: 'public',
        })
        .useWhere((request) => ({
          name: request.name,
        }))
        .useSearchable({
          name: {
            operator: 'abc',
            condition: 'def',
            defaultValue: 'public',
          },
        })
        .usePresenter((data) => ({
          name: data.name,
          Users: data.Users,
          formating: true,
        }))
        .getPaging({
          curPage: 1,
          perPage: 10,
          sortBy: 'Users.createdAt',
        });
      throw Error('unknown');
    } catch (err) {
      err.message.should.be.equal('this operator not supported.');
    }
  });
});
