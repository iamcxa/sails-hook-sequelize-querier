/**
 * 依據給予的 ID 與資料更新 target modelName
 * @version 1.0
 * @param Required {Object} {
 *     langCode{String} = 'zh-TW',   要更新的資料語系。
 *     modelName{String} = null,     要更新的目標 Sequelize Model 名稱。
 *     include{Object|Array} = null, 額外給予的 Sequelize Query-include 參數。
 *     input{Object} = null,         要新增的原始資料。
 *     where{Object} = null,         更新時的 Sequelize Query-where 查詢。
 *   }
 * @param Optional {Object} {
 *     format{Object} = null,        原始資料的格式化樣板。
 *     formatCb{Object} = null,      原始資料的格式化 callback。
 *     updateCb{Object} = null,      資料更新完成後，輸出之前的 callback（支援 await）。
 *   }
 * @example 依據 User ID 更新 User，並且更新連帶的 Parent 與 Student，同時有給予一組輸入格式 format。
 * QueryHelper.update({
 *    modelName: 'User',
 *    include: [Passport, {
 *      model: Parent,
 *      include: [{
 *        model: Student,
 *        through: 'StudentParent',
 *      }],
 *    }],
 *    where: { id },
 *    input: inputData,
 *  }, {
 *    format,
 *    formatCb: null,
 *  });
 * @returns {Object} updated item
 */
import _ from 'lodash';
export default async function update(
  {
    langCode = this.langCode,
    modelName = null,
    include = null,
    input = null,
    where = null,
  } = {},
  { format = null, formatCb = null } = {},
) {
  try {
    const { error, value } = this.validate({
      value: {
        modelName,
        input,
        where,
        langCode,
        include,
        format,
        formatCb,
      },
      schema: (j) => ({
        modelName: j.string().required(),
        input: j.object().required(),
        where: j.object().required(),
        langCode: j.string(),
        include: j.array().items(j.any()).allow(null),
        format: j.array().items(j.string()).allow(null),
        formatCb: j.func().allow(null),
      }),
    });
    if (error) {
      throw Error(
        MESSAGE.BAD_REQUEST.PARAMETER_FORMAT_INVALID({
          error,
          value,
        }),
      );
    }
    // Console.log('update modelName=>', modelName);
    const model = this.getModelByName(modelName);
    if (langCode) {
      // TODO: 語系篩選
    }
    // Console.log('update input==============>');
    // Console.dir(input);
    const query = {
      where,
    };
    if (include) {
      query.include = include;
    }
    let target = await model.findOne(query);
    if (!target) {
      throw Error(
        MESSAGE.BAD_REQUEST.NO_TARGET_FOUNDED({
          where: `${modelName}:${_.values(where)}`,
        }),
      );
    }
    if (!format) {
      const associations = this.getAssociations(modelName);
      // Console.log('associations=>', associations);
      // eslint-disable-next-line
      format = this.getModelColumns({
        modelName,
        modelPrefix: false,
        include: include
          ? _.flatten(
              this.getAssociations(modelName, {
                raw: true,
              }).map((association) =>
                this.getModelColumns({
                  modelName: association.singular,
                  modelPrefix: association.name,
                }),
              ),
            )
          : null,
      });
      // Console.log('update format==============>');
      // Console.dir(format);
    }
    target = _.merge(
      target,
      this.formatInput({
        modelName,
        format,
        formatCb,
        source: target,
        rawData: input,
      }),
    );
    // Console.log('update data==============>');
    // Console.log('target.toJSON=>', target.toJSON);
    // Console.log('target.save=>', target.save);
    // Console.dir(target.toJSON ? target.toJSON() : target);
    const structure = target.toJSON ? target.toJSON() : target;
    // Console.log('structure=>', structure);
    const updateIncludeObject = [];
    Object.keys(structure).forEach((item) => {
      if (_.isObject(structure[item]) && target[item].save) {
        updateIncludeObject.push(target[item].save());
      }
    });
    let result =
      (await Promise.all(updateIncludeObject)) && (await target.save());
    return result;
  } catch (e) {
    sails.log.error(e);
    throw e;
  }
}
